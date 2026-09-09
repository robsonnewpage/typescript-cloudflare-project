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
  }
}
