import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-semibold text-zinc-100">Resume Studio</p>
          <p className="mt-2 text-sm text-zinc-500">
            Build and tune resumes with ATS-aware scoring, profile breakdowns, and AI suggestions.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-300">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-500">
            <li>
              <Link href="/builder" className="hover:text-fuchsia-400">
                Full builder
              </Link>
            </li>
            <li>
              <Link href="/analyze" className="hover:text-fuchsia-400">
                Upload analyze
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-300">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-500">
            <li>
              <Link href="/login" className="hover:text-fuchsia-400">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-fuchsia-400">
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Resume Studio. Built for modern job seekers.
      </div>
    </footer>
  );
}
