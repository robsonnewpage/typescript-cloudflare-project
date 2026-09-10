# Meeting Intelligence

A Next.js app running natively on Cloudflare Workers — built for Project JEDI, Newpage's internal "TypeScript + Cloudflare" FDE training.

**Live:** https://meeting-intelligence.typescript-cloudflare-project.workers.dev

Meeting Intelligence turns a pile of meeting transcripts into a team's shared memory. Upload the WebVTT transcripts that Teams, Zoom, and Whisper export; the system indexes them for semantic search and surfaces every decision, commitment, and open thread, each one grounded in the exact excerpt it came from. Ask a question across the whole corpus and get an answer with citations, or open the team's inbox of unresolved open threads. At its heart is a contested write: an open thread sits unclaimed until someone resolves it, and when two teammates both try to close out the same one, only one resolution wins — the other finds out immediately, and a retried submission never produces a duplicate.

## Architecture

The whole app is one Cloudflare Worker (via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)), not a split frontend/backend. Everything below runs on the same account, same Worker, no other hosting involved.

## What's actually running on Cloudflare

| Service | Resource | Binding (`wrangler.jsonc`) | What it's for |
|---|---|---|---|
| **Workers** | `meeting-intelligence` | — | The whole app — Next.js App Router SSR, Server Actions, and every API route, via `custom-worker.ts` wrapping OpenNext's generated fetch handler. |
| **D1** (SQLite) | `meeting-intelligence-db` | `DB` | The relational core — `meetings`, `facts`, `threads`. Schema and migrations managed with [Drizzle ORM](https://orm.drizzle.team/) (`frontend/src/db/`, `frontend/migrations/`). |
| **Workers KV** | `meeting-intelligence-cache` | `CACHE` | Read-through cache for the recently-resolved-threads list; busted on every resolve so it never serves stale data past the write itself. |
| **Vectorize** | `meeting-intelligence-facts` | `VECTORIZE` | Vector index (768-dim, cosine) over every fact's embedding — this is what makes `/search` semantic instead of keyword matching. |
| **Workers AI** | — | `AI` | Two models: `@cf/baai/bge-base-en-v1.5` embeds facts on write and queries at search time; `@cf/meta/llama-3.1-8b-instruct-fp8` generates the grounded, cited answer on `/search` and `/ask` — layered on top of retrieval, independently-failable (an AI outage degrades to plain search results, never a 500). |
| **Durable Objects** | `ThreadArbiterDO` | `THREAD_ARBITER` | One instance per thread (`idFromName`), arbitrating the `claim` → `resolve` lifecycle so two people racing to close the same thread can't both win. Idempotency cache lives in the DO's own SQLite storage. Called from Server Actions as real RPC (`stub.claim(...)`), not HTTP. |
| **Cron Triggers** | `*/15 * * * *` | — | `scheduled()` in `custom-worker.ts` sweeps threads claimed 30+ minutes ago back to `open`, with an idempotent UPSERT for its own run bookkeeping. |
| **R2** | `meeting-intelligence-transcripts` | `TRANSCRIPTS` | Transcript file storage. Uploads and downloads go straight from the browser to R2 via presigned URLs (`aws4fetch`, signed with a dedicated R2 API token) — the file bytes never pass through the Worker. |
| **Service bindings** | `meeting-intelligence` (self) | `WORKER_SELF_REFERENCE` | OpenNext's own internal loopback for ISR/cache-purge — not app code we wrote. |
| **Images** | — | `IMAGES` | Next.js `<Image>` optimization, handled natively by Cloudflare instead of a separate image service. |
| **Workers Assets** | `.open-next/assets` | `ASSETS` | Static files (JS/CSS chunks, favicon) served directly by the Workers runtime, no separate CDN/bucket. |

D1, KV, Durable Objects, and Workers AI all have local simulators (`wrangler dev`/`preview` runs them against local state). **Vectorize and R2 don't** — even in local preview, those two calls hit the real remote resources on the live Cloudflare account (that's what `"remote": true` on the Vectorize binding means).

## Repo layout

```
frontend/           the Next.js app — everything actually lives here
Makefile            thin wrapper around the frontend/ npm scripts
```

## Running it

```bash
make install      # npm install in frontend/
make dev           # dev server at :3000 (Node runtime, no Cloudflare bindings)
make cf-preview    # build + preview on the real Workers runtime (D1/KV/AI/DO all work; Vectorize/R2 hit the real remote resources — no local simulator for either)
make typecheck
make lint
make cf-deploy     # deploy to the live Cloudflare account — requires `wrangler login`, run manually only
```

`frontend/.dev.vars` holds local secrets (`ADMIN_TOKEN`, `R2_TRANSCRIPTS_*`) — copy `.dev.vars.example` if present, or ask whoever set up the Cloudflare account for values. See `frontend/wrangler.jsonc` for the full binding list.

## Course scope

Implements Clusters A through E in full. Deliberately skipped, per the curriculum marking them optional: the Queue + consumer bullet in Cluster E, and all of Cluster F.
