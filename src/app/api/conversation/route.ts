import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: { id: true, title: true, starred: true, updatedAt: true }
  });
  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title = "New Chat" } = await req.json().catch(() => ({}));
  const conversation = await prisma.conversation.create({
    data: { userId: session.user.id, title: String(title).slice(0, 100) }
  });
  return NextResponse.json(conversation);
}
