"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Login failed.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-zinc-400">Continue building your resume.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input className="w-full rounded-lg border border-white/10 bg-zinc-800 p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-lg border border-white/10 bg-zinc-800 p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button className="w-full rounded-lg bg-fuchsia-600 py-2 font-semibold hover:bg-fuchsia-500" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-zinc-400">
          New user?{" "}
          <Link href="/register" className="text-fuchsia-300 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
