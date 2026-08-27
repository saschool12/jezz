import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiUrl, GEMINI_MODELS } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });

  const body = await req.json();
  const conversationId = String(body.conversationId || "");
  const model = GEMINI_MODELS.includes(body.model) ? body.model : "gemini-2.5-flash";
  const temperature = Math.min(1, Math.max(0, Number(body.temperature ?? 0.7)));
  const maxTokens = Math.min(8192, Math.max(256, Number(body.maxTokens ?? 4096)));
  const systemPrompt = String(body.systemPrompt || "You are Jhonny AI, a helpful and accurate assistant.").slice(0, 12000);
  const userMessage = String(body.message || "").trim().slice(0, 30000);

  if (!userMessage) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  let conversation = conversationId
    ? await prisma.conversation.findFirst({ where: { id: conversationId, userId: session.user.id } })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId: session.user.id, title: userMessage.slice(0, 70) || "New Chat" }
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "user", content: userMessage, model }
  });

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 30
  });

  const contents = history.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const upstream = await fetch(geminiUrl(model, true), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature, maxOutputTokens: maxTokens }
    })
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text();
    console.error(detail);
    return NextResponse.json({ error: "Gemini request failed." }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let assistantText = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const raw = trimmed.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;
            try {
              const data = JSON.parse(raw);
              const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
              if (text) {
                assistantText += text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
              }
              if (data.usageMetadata) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ usage: data.usageMetadata })}\n\n`));
              }
            } catch {}
          }
        }

        await prisma.message.create({
          data: { conversationId: conversation.id, role: "assistant", content: assistantText, model }
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() }
        });

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: conversation.id })}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (e) {
        console.error(e);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Streaming failed." })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
