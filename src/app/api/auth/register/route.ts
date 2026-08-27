import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });

  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email: normalized } });
  if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email: normalized, passwordHash }
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
