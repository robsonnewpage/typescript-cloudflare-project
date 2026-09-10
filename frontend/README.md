## Meeting Intelligence

Meeting Intelligence turns a pile of meeting transcripts into a team's shared memory. Upload the WebVTT transcripts that Teams, Zoom, and Whisper export; the system parses them into speaker-attributed turns, indexes them for search, and extracts every decision, commitment, and open thread an LLM can find, each one grounded in the exact excerpt it came from. Ask a question across the whole corpus and get an answer with inline citations, or open the team's inbox of unresolved open threads and see what's still hanging. It's for teams with enough recurring meetings that nobody can hold the whole thread in their head — standups, retros, client syncs. At its heart is a contested write: an open thread sits unclaimed until someone resolves it, and when two teammates both try to close out the same one, only one resolution wins — the other finds out immediately who beat them to it, and a retried submission never produces a duplicate.

See the [root README](../README.md) for architecture, deployment, and the full Cloudflare service list. This file just covers running the frontend on its own.

---

This is a [Next.js](https://nextjs.org) app on the App Router, deployed to Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) — not Vercel, so the usual create-next-app deploy instructions don't apply here.

## Getting started

```bash
npm install
npm run dev       # plain Node dev server at :3000 — no Cloudflare bindings (D1/KV/R2/AI/DO) available here
npm run preview   # build + run on the real Workers runtime instead — needed to exercise any binding
npm run deploy    # ship to the live Cloudflare account (requires `wrangler login`)
npm run cf-typegen  # regenerate cloudflare-env.d.ts after changing wrangler.jsonc bindings
```

Local secrets (`ADMIN_TOKEN`, `R2_TRANSCRIPTS_ACCOUNT_ID`, `R2_TRANSCRIPTS_ACCESS_KEY_ID`, `R2_TRANSCRIPTS_SECRET_ACCESS_KEY`) go in `.dev.vars` (gitignored) — see `src/env.d.ts` for the full list this app expects beyond what `wrangler.jsonc` declares.
