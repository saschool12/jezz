"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  async function submit(e:React.FormEvent){e.preventDefault();setError("");const r=await signIn("credentials",{email,password,redirect:false,callbackUrl:"/"});if(r?.error)setError("Invalid email or password.");else location.href="/";}
  return <main className="min-h-screen grid place-items-center bg-[#070a0d] p-5"><div className="card w-full max-w-md p-7"><div className="mb-7 text-center"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400"><Bot/></div><h1 className="text-2xl font-bold">Welcome to JHONNY AI</h1><p className="mt-1 text-sm text-gray-500">Sign in to continue</p></div><form onSubmit={submit} className="space-y-4"><input className="w-full rounded-xl border border-[#25312c] bg-[#0c1110] p-3 outline-none" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input className="w-full rounded-xl border border-[#25312c] bg-[#0c1110] p-3 outline-none" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p className="text-sm text-red-400">{error}</p>}<button className="w-full rounded-xl bg-emerald-500 p-3 font-semibold text-black">Sign in</button></form><button onClick={()=>signIn("google",{callbackUrl:"/"})} className="mt-3 w-full rounded-xl border border-[#25312c] p-3">Continue with Google</button><p className="mt-5 text-center text-sm text-gray-500">No account? <Link className="text-emerald-400" href="/register">Create one</Link></p></div></main>
}
