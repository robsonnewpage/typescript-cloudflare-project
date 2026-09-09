import "server-only";
import { AwsClient } from "aws4fetch";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const BUCKET_NAME = "meeting-intelligence-transcripts";
const PRESIGN_EXPIRY_SECONDS = 300; // 5 minutes — long enough to start an upload, short enough to not linger as a live write credential

// R2 has no native presigned-URL binding method (unlike a Worker's own R2
// binding, which only supports server-side reads/writes) — the upload
// itself needs to bypass this Worker entirely and go straight from the
// browser to R2's S3-compatible endpoint, so it's signed with aws4fetch
// against a separately-created R2 API token (Access Key ID/Secret Access
// Key), not the account's regular Cloudflare API token.
async function getClient(): Promise<{ client: AwsClient; endpoint: string }> {
  const { env } = await getCloudflareContext({ async: true });
  const client = new AwsClient({
    accessKeyId: env.R2_TRANSCRIPTS_ACCESS_KEY_ID,
    secretAccessKey: env.R2_TRANSCRIPTS_SECRET_ACCESS_KEY,
  });
  return { client, endpoint: `https://${env.R2_TRANSCRIPTS_ACCOUNT_ID}.r2.cloudflarestorage.com` };
}

export function transcriptKeyFor(meetingId: string, filename: string): string {
  return `meetings/${meetingId}/${filename}`;
}

export async function createPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const { client, endpoint } = await getClient();
  const url = new URL(`${endpoint}/${BUCKET_NAME}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(PRESIGN_EXPIRY_SECONDS));

  const signed = await client.sign(
    new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }),
    { aws: { signQuery: true } },
  );
  return signed.url;
}

export async function createPresignedDownloadUrl(key: string): Promise<string> {
  const { client, endpoint } = await getClient();
  const url = new URL(`${endpoint}/${BUCKET_NAME}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(PRESIGN_EXPIRY_SECONDS));

  const signed = await client.sign(new Request(url, { method: "GET" }), { aws: { signQuery: true } });
  return signed.url;
}
