import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { conversationId, model = "gemini-2.5-flash" } = await req.json();
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } }
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lastUser = [...conversation.messages].reverse().find(m => m.role === "user");
  if (!lastUser) return NextResponse.json({ error: "No user message." }, { status: 400 });
  await prisma.message.deleteMany({
    where: { conversationId, role: "assistant", createdAt: { gt: lastUser.createdAt } }
  });
  const origin = new URL("/api/chat/stream", req.url);
  return fetch(origin, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") || "" },
    body: JSON.stringify({ conversationId, message: lastUser.content, model })
  });
}
