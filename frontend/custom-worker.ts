// Wraps OpenNext's generated fetch handler so this same Worker can also
// export a Durable Object class and a scheduled() cron handler — OpenNext's
// own build only knows how to produce a fetch handler, so `main` points
// here instead of straight at .open-next/worker.js.
// https://opennext.js.org/cloudflare/howtos/custom-worker
//
// This module only exists after opennextjs-cloudflare's bundling phase,
// which runs after next build's own typecheck — so whether this import
// resolves depends on which phase tsc is currently running in. The
// "expect an error" variant of this suppression would fail the phase
// where the file already exists (nothing left to expect), so this needs
// the unconditional variant instead.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as openNextHandler } from "./.open-next/worker.js";
import { sweepStaleClaims } from "./src/lib/cron/sweep-stale-claims";

export { ThreadArbiterDO } from "./src/durable-objects/thread-arbiter";

export default {
  fetch: openNextHandler.fetch,
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(sweepStaleClaims(env));
  },
} satisfies ExportedHandler<CloudflareEnv>;
