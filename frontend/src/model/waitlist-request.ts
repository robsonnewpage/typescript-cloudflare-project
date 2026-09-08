export interface WaitlistRequestBody {
  name: string;
  email: string;
}

export function isWaitlistRequestBody(value: unknown): value is WaitlistRequestBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.email === "string" &&
    candidate.email.includes("@")
  );
}
