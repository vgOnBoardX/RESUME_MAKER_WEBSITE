"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string };

export function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user: User };
      setUser(data.user);
    })();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  };

  if (user === undefined) {
    return <span className="hidden w-24 sm:block" aria-hidden />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <span
          className="max-w-44 truncate text-sm font-semibold text-zinc-200 sm:max-w-64 sm:text-base"
          title={user.name}
        >
          {user.name}
        </span>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg border border-white/15 px-2 py-1.5 text-sm text-zinc-300 hover:bg-white/10 sm:px-3"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="rounded-lg px-2 py-1.5 text-zinc-300 hover:bg-white/10">
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-fuchsia-600 px-2 py-1.5 font-medium text-white hover:bg-fuchsia-500 sm:px-3"
      >
        Sign up
      </Link>
    </div>
  );
}
