import { NextResponse } from "next/server";
import { isWaitlistRequestBody } from "@/model/waitlist-request";

export async function POST(request: Request) {
  // request.json() resolves to `any`; treat it as unknown until the guard below narrows it.
  const body: unknown = await request.json();

  if (!isWaitlistRequestBody(body)) {
    return NextResponse.json(
      { message: "Please provide a valid name and email address." },
      { status: 400 }
    );
  }

  console.log(`Waitlist signup: ${body.name} <${body.email}>`);

  return NextResponse.json(
    { message: `Thanks, ${body.name}! You're on the list.` },
    { status: 200 }
  );
}
