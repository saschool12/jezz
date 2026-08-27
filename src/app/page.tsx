"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Bot, ChevronDown, Copy, Edit3, Menu, MoreHorizontal, Paperclip,
  Plus, Search, Send, Settings, Share2, Sparkles, Star, Trash2,
  RefreshCw, X, LogOut, ShieldCheck, Zap, Database, Code2
} from "lucide-react";

type Conversation = { id: string; title: string; starred: boolean };
type Message = { id?: string; role: "user" | "assistant"; content: string };

const starter: Message[] = [
  { role: "assistant", content: "Welcome to **JHONNY AI**. I’m ready to help with code, school work, research, ideas, and more." }
];

export default function Home() {
  const { data: session, status } = useSession();
  const [mobile, setMobile] = useState(false);
  const [settings, setSettings] = useState(false);
  const [model, setModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState("You are Jhonny AI, a helpful and accurate AI assistant.");
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(starter);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  const filtered = useMemo(() =>
    conversations.filter(c => c.title.toLowerCase().includes(query.toLowerCase())), [conversations, query]);

  useEffect(() => {
    if (session) loadConversations();
  }, [session]);

  async function loadConversations() {
    const r = await fetch("/api/conversations");
    if (r.ok) setConversations(await r.json());
  }

  async function newChat() {
    setActive(null);
    setMessages(starter);
    setMobile(false);
  }

  async function openChat(id: string) {
    const r = await fetch(`/api/conversations/${id}`);
    if (!r.ok) return;
    const data = await r.json();
    setActive(id);
    setMessages(data.messages.map((m: Message) => ({ role: m.role, content: m.content })));
    setMobile(false);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;
    if (!session) {
      await signIn(undefined, { callbackUrl: "/" });
      return;
    }

    const next = [...messages, { role: "user" as const, content: text }, { role: "assistant" as const, content: "" }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: active,
          message: text,
          model,
          temperature,
          maxTokens,
          systemPrompt
        })
      });

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ error: "Request failed." }));
        throw new Error(err.error);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const data = JSON.parse(raw);
            if (data.conversationId) setActive(data.conversationId);
            if (data.content) {
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + data.content };
                return copy;
              });
            }
          } catch {}
        }
      }
      loadConversations();
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `**Error:** ${e instanceof Error ? e.message : "Something went wrong."}` }]);
    } finally {
      setStreaming(false);
    }
  }

  async function deleteChat(id: string) {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (active === id) newChat();
    loadConversations();
  }

  if (status === "loading") return <div className="min-h-screen grid place-items-center bg-[#070a0d]"><Sparkles className="animate-pulse text-emerald-400" /></div>;

  // Feature data with explicit type
  const features: { icon: React.ElementType; title: string; items: string[] }[] = [
    { icon: ShieldCheck, title: "SECURITY", items: ["Password hashing","JWT/session security","Rate limiting","Zod validation","Security headers","Secure Gemini API key storage"] },
    { icon: Zap, title: "PERFORMANCE", items: ["React Server Components","Streaming responses","Caching","Lazy loading","Infinite scrolling","Optimized API requests"] },
    { icon: Database, title: "DEPLOYMENT", items: ["Vercel","PostgreSQL / Neon","Production environment variables","Serverless API routes"] },
    { icon: Code2, title: "TESTING", items: ["Jest","React Testing Library","Playwright","API testing"] }
  ];

  return (
    <main className="min-h-screen bg-[#070a0d]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] overflow-hidden border-x border-[#18211e]">
        <aside className={`${mobile ? "fixed inset-y-0 left-0 z-50 w-[290px]" : "hidden lg:flex w-[280px]"} flex-col border-r border-[#18211e] bg-[#090d0c]`}>
          <div className="flex items-center justify-between border-b border-[#18211e] p-4">
            <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400"><Bot size={21}/></div><b>JHONNY AI</b></div>
            <button onClick={() => setMobile(false)} className="lg:hidden"><X size={18}/></button>
          </div>
          <div className="p-3">
            <button onClick={newChat} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black"><Plus size={18}/> New Chat</button>
          </div>
          <div className="px-3 pb-2"><div className="flex items-center gap-2 rounded-xl border border-[#1b2521] bg-[#0c1110] px-3 py-2"><Search size={16} className="text-gray-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search conversations..." className="w-full bg-transparent text-sm outline-none"/></div></div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {filtered.map(c => <div key={c.id} className={`group mb-1 flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${active===c.id?"bg-[#131b18]":"hover:bg-[#0f1513]"}`}>
              <button onClick={()=>openChat(c.id)} className="min-w-0 flex-1 truncate text-left">{c.title}</button>
              {c.starred && <Star size={13} className="text-emerald-400"/>}
              <button onClick={()=>deleteChat(c.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
            </div>)}
          </div>
          <div className="border-t border-[#18211e] p-3">
            {session ? <div className="flex items-center justify-between"><div className="min-w-0"><div className="truncate text-sm font-medium">{session.user?.name || "User"}</div><div className="truncate text-xs text-gray-500">{session.user?.email}</div></div><button onClick={()=>signOut()}><LogOut size={16}/></button></div> :
              <button onClick={()=>signIn(undefined,{callbackUrl:"/"})} className="w-full rounded-xl border border-[#25312c] px-3 py-2 text-sm">Sign in</button>}
          </div>
        </aside>

        {mobile && <div onClick={()=>setMobile(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden"/>}

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-[#18211e] px-4 lg:px-6">
            <div className="flex items-center gap-3"><button onClick={()=>setMobile(true)} className="lg:hidden"><Menu/></button><span className="font-semibold">JHONNY AI</span><span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-xs text-emerald-300 sm:inline">Gemini Powered</span></div>
            <div className="flex items-center gap-2">
              <select value={model} onChange={e=>setModel(e.target.value)} className="rounded-lg border border-[#202b27] bg-[#0c1110] px-3 py-2 text-xs outline-none"><option value="gemini-2.5-flash">Gemini 2.5 Flash</option><option value="gemini-2.5-pro">Gemini 2.5 Pro</option></select>
              <button onClick={()=>setSettings(!settings)} className="rounded-lg border border-[#202b27] p-2 hover:bg-[#111815]"><Settings size={17}/></button>
              <button className="hidden rounded-lg border border-[#202b27] p-2 sm:block"><MoreHorizontal size={17}/></button>
            </div>
          </header>

          <div className="flex flex-1 min-h-0">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                <div className="mx-auto max-w-4xl space-y-6">
                  {!active && messages.length === 1 && <div className="py-10 text-center"><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 glow"><Sparkles size={28}/></div><h1 className="text-3xl font-bold">How can I help?</h1><p className="mt-2 text-gray-500">Ask Jhonny AI anything.</p></div>}
                  {messages.map((m,i)=><div key={i} className={`flex gap-3 ${m.role==="user"?"justify-end":""}`}>
                    {m.role==="assistant" && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400"><Bot size={17}/></div>}
                    <div className={`${m.role==="user"?"max-w-[85%] rounded-2xl bg-[#0f1714] px-4 py-3 border border-[#1c2823]":"min-w-0 max-w-[90%]"} text-[15px] leading-7`}>
                      {m.role==="assistant" ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || (streaming ? "▋" : "")}</ReactMarkdown></div> : <div>{m.content}</div>}
                      {m.role==="assistant" && m.content && !streaming && <div className="mt-3 flex gap-1 border-t border-[#17201d] pt-2"><button onClick={()=>navigator.clipboard.writeText(m.content)} className="rounded-md p-1.5 text-gray-500 hover:bg-[#111815] hover:text-white" title="Copy"><Copy size={14}/></button><button className="rounded-md p-1.5 text-gray-500 hover:bg-[#111815] hover:text-white" title="Regenerate"><RefreshCw size={14}/></button><button className="rounded-md p-1.5 text-gray-500 hover:bg-[#111815] hover:text-white" title="Share"><Share2 size={14}/></button></div>}
                    </div>
                  </div>)}
                </div>
              </div>

              <div className="border-t border-[#18211e] p-3 lg:p-5">
                <div className="mx-auto max-w-4xl">
                  <div className="rounded-2xl border border-[#27332e] bg-[#0c1110] p-2 focus-within:border-emerald-500/40">
                    <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}}} placeholder="Message Jhonny AI..." rows={2} className="w-full resize-none bg-transparent px-3 py-2 outline-none placeholder:text-gray-600"/>
                    <div className="flex items-center justify-between px-2 pb-1"><button className="rounded-lg p-2 text-gray-500 hover:bg-[#131b18] hover:text-white"><Paperclip size={17}/></button><button onClick={sendMessage} disabled={streaming || !input.trim()} className="rounded-lg bg-emerald-500 p-2 text-black disabled:opacity-30"><Send size={17}/></button></div>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-gray-600">Jhonny AI can make mistakes. Check important information.</p>
                </div>
              </div>
            </div>

            {settings && <aside className="hidden w-72 border-l border-[#18211e] bg-[#090d0c] p-5 xl:block">
              <div className="mb-5 flex items-center justify-between"><b>Settings</b><button onClick={()=>setSettings(false)}><X size={16}/></button></div>
              <label className="mb-2 block text-xs text-gray-500">Model</label>
              <select value={model} onChange={e=>setModel(e.target.value)} className="mb-5 w-full rounded-lg border border-[#202b27] bg-[#0c1110] p-2 text-sm"><option value="gemini-2.5-flash">Gemini 2.5 Flash</option><option value="gemini-2.5-pro">Gemini 2.5 Pro</option></select>
              <label className="mb-2 block text-xs text-gray-500">Temperature <span className="float-right text-white">{temperature}</span></label>
              <input type="range" min="0" max="1" step=".1" value={temperature} onChange={e=>setTemperature(Number(e.target.value))} className="mb-6 w-full accent-emerald-500"/>
              <label className="mb-2 block text-xs text-gray-500">Max Tokens</label>
              <input type="number" value={maxTokens} onChange={e=>setMaxTokens(Number(e.target.value))} className="mb-5 w-full rounded-lg border border-[#202b27] bg-[#0c1110] p-2 text-sm"/>
              <label className="mb-2 block text-xs text-gray-500">System Prompt</label>
              <textarea value={systemPrompt} onChange={e=>setSystemPrompt(e.target.value)} rows={6} className="w-full resize-none rounded-lg border border-[#202b27] bg-[#0c1110] p-2 text-sm outline-none"/>
              <div className="mt-5 rounded-xl border border-[#1b2521] bg-[#0c1110] p-3"><div className="text-xs text-gray-500">Provider</div><div className="mt-1 flex items-center gap-2 text-sm"><Sparkles size={14} className="text-emerald-400"/> Google Gemini</div></div>
            </aside>}
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-[1500px] border-x border-t border-[#18211e] bg-[#090d0c] p-5 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, items }) => (
            <div key={title} className="card p-5">
              <div className="mb-4 flex items-center gap-2 text-emerald-400">
                <Icon size={19} />
                <b>{title}</b>
              </div>
              {items.map(item => (
                <div key={item} className="mb-2 text-xs text-gray-500">• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
        }
