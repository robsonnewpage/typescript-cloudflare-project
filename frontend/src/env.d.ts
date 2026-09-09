// Secrets aren't declared in wrangler.jsonc (only bindings/vars are), so
// `wrangler types` can't know about them ahead of time. This is a module
// (it has an import below) so the augmentation needs `declare global` to
// merge with the ambient CloudflareEnv from cloudflare-env.d.ts rather than
// shadowing it locally. One place for all of them, instead of scattering
// `declare global` blocks across every route that reads a secret.
import type {} from "@opennextjs/cloudflare";

declare global {
  interface CloudflareEnv {
    ADMIN_TOKEN: string;
    // Not named CF_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY: OpenNext's
    // own ambient CloudflareEnv augmentation (for its unrelated R2 cache-purge
    // feature) already declares those exact names as optional, and that merge
    // wins — these end up typed `string | undefined` no matter what's declared
    // here. Different names sidestep the collision entirely.
    R2_TRANSCRIPTS_ACCOUNT_ID: string;
    R2_TRANSCRIPTS_ACCESS_KEY_ID: string;
    R2_TRANSCRIPTS_SECRET_ACCESS_KEY: string;
  }
}
