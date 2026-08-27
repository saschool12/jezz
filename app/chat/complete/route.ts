import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const base = new URL("/api/chat/stream", req.url);
  const response = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") || "" },
    body: JSON.stringify({ ...body, stream: true })
  });
  return new NextResponse(response.body, { status: response.status, headers: response.headers });
}
