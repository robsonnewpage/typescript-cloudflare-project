export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Request to ${url} failed: ${response.status} ${response.statusText}`);
  }

  // Response.json() is typed Promise<any> — this cast asserts the shape, it doesn't prove it.
  return (await response.json()) as T;
}
