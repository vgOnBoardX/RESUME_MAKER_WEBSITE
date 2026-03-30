import Link from "next/link";
import { AuthNav } from "./AuthNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100">
          <span className="rounded-lg bg-linear-to-br from-fuchsia-500 to-cyan-500 px-2 py-1 text-sm font-bold text-white">
            RM
          </span>
          <span className="hidden sm:inline">Resume Studio</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-3">
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
