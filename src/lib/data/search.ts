import "server-only";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db/client";
import { facts } from "@/db/schema";

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
const GENERATION_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

export interface FactSearchResult {
  fact: typeof facts.$inferSelect;
  score: number;
}

export interface AskResult {
  question: string;
  answer: string | null;
  citedFacts: FactSearchResult[];
  generated: boolean;
}

// The model's generated output type is a union with the async-batch response
// shape ({ request_id }), which only happens when the call is made with a
// `requests: [...]` batch input — we always call it with a single `text`,
// so the async branch is unreachable, but the compiler can't know that from
// the input shape. Narrow explicitly instead of asserting past it.
async function embed(env: CloudflareEnv, text: string): Promise<number[]> {
  const embedding = await env.AI.run(EMBEDDING_MODEL, { text });
  if (!("data" in embedding) || !embedding.data) {
    throw new Error("Workers AI returned an async-batch response for a single-text embedding request.");
  }
  return embedding.data[0];
}

export async function embedAndUpsertFact(fact: typeof facts.$inferSelect): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const values = await embed(env, fact.statement);

  await env.VECTORIZE.upsert([
    { id: fact.id, values, metadata: { meetingId: fact.meetingId, kind: fact.kind } },
  ]);

  const db = await getDb();
  await db.update(facts).set({ embeddedAt: new Date().toISOString() }).where(eq(facts.id, fact.id));
}

export async function searchFacts(query: string, topK = 5): Promise<FactSearchResult[]> {
  const { env } = await getCloudflareContext({ async: true });
  const values = await embed(env, query);

  const matched = await env.VECTORIZE.query(values, { topK, returnMetadata: "none" });

  const db = await getDb();
  const results = await Promise.all(
    matched.matches.map(async (m): Promise<FactSearchResult | null> => {
      const [fact] = await db.select().from(facts).where(eq(facts.id, m.id)).limit(1);
      return fact ? { fact, score: m.score } : null;
    }),
  );

  return results.filter((r): r is FactSearchResult => r !== null);
}

function buildGroundedPrompt(question: string, facts: FactSearchResult[]): string {
  const context = facts.map((r) => `[${r.fact.id}] (${r.fact.kind}) ${r.fact.statement}`).join("\n");
  return `Facts from past meetings:\n${context}\n\nQuestion: ${question}\n\nAnswer using only the facts above. Cite fact ids like [f1]. If the facts don't answer the question, say so plainly.`;
}

// Retrieval (Vectorize, via searchFacts) always runs; generation (Workers AI)
// is layered on top and independently failable — an AI outage degrades this
// to the same cited-facts result searchFacts already gives, never throws.
export async function askQuestion(question: string, topK = 5): Promise<AskResult> {
  const retrieved = await searchFacts(question, topK);

  try {
    const { env } = await getCloudflareContext({ async: true });
    const generation = await env.AI.run(GENERATION_MODEL, {
      messages: [
        { role: "system", content: "Answer only from the facts the user provides. Cite fact ids in brackets, e.g. [f1]." },
        { role: "user", content: buildGroundedPrompt(question, retrieved) },
      ],
    });

    const answer = "response" in generation ? generation.response : null;
    return {
      question,
      answer: answer ?? null,
      citedFacts: retrieved,
      generated: answer !== null && answer !== undefined,
    };
  } catch (err) {
    console.error("[AUDIT] rag.generation_failed", err);
    return { question, answer: null, citedFacts: retrieved, generated: false };
  }
}
