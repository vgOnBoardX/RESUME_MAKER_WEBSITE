"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.replace("/login");
        return;
      }
      const data = (await response.json()) as { user: User };
      setUser(data.user);
    };
    void load();
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!user) {
    return <main className="min-h-screen bg-zinc-950 p-10 text-zinc-100">Loading dashboard...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome, {user.name}</h1>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
          <button onClick={logout} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            Logout
          </button>
        </div>

        <p className="mt-6 text-sm text-zinc-400">
          Start from your dashboard, then open the studio when you’re ready to build or run ATS checks.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/builder" className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 hover:border-fuchsia-500/60">
            <h2 className="text-xl font-semibold">AI Resume Builder</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Full-screen builder with forms, AI optimize, and PDF download.
            </p>
          </Link>

          <Link href="/analyze" className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 hover:border-emerald-500/60">
            <h2 className="text-xl font-semibold">Upload & ATS Analyze</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Dedicated upload flow: extract text, score, and get improvement suggestions.
            </p>
          </Link>

          <Link href="/" className="md:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-950/50 to-cyan-950/50 p-6 hover:border-fuchsia-500/60">
            <h2 className="text-xl font-semibold text-white">Resume Studio (homepage)</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Combined experience: build and upload on one page, with the ATS ring and profile graph at the bottom.
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-fuchsia-400">Open studio →</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
