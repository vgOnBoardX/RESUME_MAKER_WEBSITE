/**
 * Shown before the user runs ATS so the bottom of the page previews the circular gauge + bar layout.
 */
export function AtsDashboardPlaceholder() {
  const mock = [
    { label: "LinkedIn", w: 0 },
    { label: "Portfolio", w: 0 },
    { label: "Role keywords", w: 0 },
    { label: "Experience", w: 0 },
  ];
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 p-8 opacity-70">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex items-center gap-6">
          <div className="h-36 w-36 shrink-0 rounded-full border-2 border-dashed border-zinc-600" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">ATS score (preview)</p>
            <p className="mt-1 text-sm text-zinc-500">Run a check above to fill this ring.</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-500">Profile measurements (preview)</p>
          {mock.map((m) => (
            <div key={m.label}>
              <div className="mb-1 flex justify-between text-xs text-zinc-600">
                <span>{m.label}</span>
                <span>—/100</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-800/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
