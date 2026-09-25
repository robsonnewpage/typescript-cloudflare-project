import { NextResponse, type NextRequest } from "next/server";
import { searchFacts } from "@/lib/data/search";

// The plain JSON API, kept independent of the /search page's UI (curl-able
// on its own). Nested under /search/api rather than /search itself since a
// route.ts and a page.tsx can't share one segment in the App Router, and
// /search is now the human-facing page.
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing ?q= query parameter" }, { status: 400 });
  }

  const results = await searchFacts(query);
  return NextResponse.json({
    query,
    results: results.map((r) => ({ fact: r.fact, score: r.score })),
  });
}
