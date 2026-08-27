import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const usage = await prisma.usage.aggregate({
    where: { userId: session.user.id },
    _sum: { promptTokens: true, completionTokens: true, totalTokens: true }
  });
  return NextResponse.json(usage._sum);
}
