"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      await signIn("credentials", { email, password, callbackUrl: "/" });
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0d] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-[#0f1513] p-8 rounded-2xl border border-[#1b2521] w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Create account</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#1a2420] border border-[#25312c] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none mb-4 focus:border-emerald-500"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#1a2420] border border-[#25312c] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none mb-4 focus:border-emerald-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#1a2420] border border-[#25312c] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none mb-6 focus:border-emerald-500"
          required
        />
        <button type="submit" className="w-full bg-emerald-500 text-black font-semibold py-3 rounded-lg hover:bg-emerald-400 transition">
          Sign Up
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <button type="button" onClick={() => router.push("/auth/signin")} className="text-emerald-400 hover:underline">
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
