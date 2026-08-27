import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  const [conversations, usage] = await Promise.all([
    prisma.conversation.count({ where: { userId: session.user.id } }),
    prisma.usage.aggregate({ where: { userId: session.user.id }, _sum: { totalTokens: true } })
  ]);
  return <main className="min-h-screen bg-[#070a0d] p-6 lg:p-10"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-bold">JHONNY AI Dashboard</h1><p className="mt-2 text-gray-500">Usage and account overview.</p><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="card p-6"><p className="text-sm text-gray-500">Conversations</p><b className="mt-2 block text-3xl">{conversations}</b></div><div className="card p-6"><p className="text-sm text-gray-500">Total Tokens</p><b className="mt-2 block text-3xl">{usage._sum.totalTokens || 0}</b></div><div className="card p-6"><p className="text-sm text-gray-500">Provider</p><b className="mt-2 block text-3xl text-emerald-400">Gemini</b></div></div></div></main>;
}
