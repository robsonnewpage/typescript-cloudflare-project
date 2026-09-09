import { NextResponse, type NextRequest } from "next/server";
import { askQuestion } from "@/lib/data/search";

// The JSON API for the same RAG capability the /search page's UI uses
// directly (askQuestion() is shared, not re-implemented) — kept as a
// route.ts so it's still curl-able independent of any page.
export async function GET(request: NextRequest) {
  const question = request.nextUrl.searchParams.get("q");
  if (!question) {
    return NextResponse.json({ error: "Missing ?q= query parameter" }, { status: 400 });
  }

  const result = await askQuestion(question);
  return NextResponse.json({
    question: result.question,
    answer: result.answer,
    citedFacts: result.citedFacts.map((r) => ({ fact: r.fact, score: r.score })),
    generated: result.generated,
  });
}
