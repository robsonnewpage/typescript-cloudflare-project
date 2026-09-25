import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "drizzle-kit";

// Drizzle Studio against the LOCAL D1 database — the SQLite file wrangler's
// simulator keeps under .wrangler/. Separate from drizzle.config.ts so
// migration generation stays untouched. Run migrations (and optionally the
// seed) locally first, or there's no file to open.
const D1_STATE_DIR = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";

function findLocalD1File(): string {
  const files = readdirSync(D1_STATE_DIR).filter((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite");
  if (files.length !== 1) {
    throw new Error(`Expected one local D1 database in ${D1_STATE_DIR}, found ${files.length}.`);
  }
  return join(D1_STATE_DIR, files[0]);
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: { url: `file:${findLocalD1File()}` },
});
