# Meeting Intelligence

A Next.js app running natively on Cloudflare Workers — built for Project JEDI, Newpage's internal "TypeScript + Cloudflare" FDE training.

**Live:** https://meeting-intelligence.typescript-cloudflare-project.workers.dev

Meeting Intelligence turns a pile of meeting transcripts into a team's shared memory. Upload the WebVTT transcripts that Teams, Zoom, and Whisper export; the system indexes them for semantic search and surfaces every decision, commitment, and open thread, each one grounded in the exact excerpt it came from. Ask a question across the whole corpus and get an answer with citations, or open the team's inbox of unresolved open threads. At its heart is a contested write: an open thread sits unclaimed until someone resolves it, and when two teammates both try to close out the same one, only one resolution wins — the other finds out immediately, and a retried submission never produces a duplicate.

## Architecture

The whole app is one Cloudflare Worker (via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)), not a split frontend/backend:

- **Routing & data** — Next.js App Router, Server Actions, Zod validation shared between client and server.
- **D1** (SQLite) — meetings, facts, threads. [Drizzle ORM](https://orm.drizzle.team/), migrations in `frontend/migrations/`.
- **KV** — read-through cache for the resolved-threads list, busted on write.
- **Vectorize + Workers AI** — facts are embedded (`@cf/baai/bge-base-en-v1.5`) and indexed on write; `/search` retrieves by cosine similarity and layers a grounded, cited answer on top via Llama (`@cf/meta/llama-3.1-8b-instruct-fp8`), independently-failable from retrieval.
- **Durable Objects** — `ThreadArbiterDO`, one instance per thread, arbitrates the `claim` → `resolve` lifecycle with an idempotency cache in its own SQLite storage, called from Server Actions as RPC via a service binding.
- **`scheduled()` cron** — sweeps stale claims back to `open` every 15 minutes, via a `custom-worker.ts` entry point that wraps OpenNext's generated fetch handler alongside the Durable Object export and the cron handler.
- **R2** — transcript storage. Uploads and downloads go straight from the browser to R2 via presigned URLs (`aws4fetch`), never through the Worker.

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
