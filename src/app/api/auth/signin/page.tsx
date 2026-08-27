"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Invalid credentials");
    else router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#070a0d] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-[#0f1513] p-8 rounded-2xl border border-[#1b2521] w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Welcome back</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
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
          Sign In
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          No account?{" "}
          <button type="button" onClick={() => router.push("/auth/signup")} className="text-emerald-400 hover:underline">
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}
