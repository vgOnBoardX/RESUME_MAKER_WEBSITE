import type { ProfileDimension } from "@/types/resume";

type Props = {
  dimensions: ProfileDimension[];
};

export function ProfileDimensionChart({ dimensions }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-zinc-100">Profile signal graph</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Each bar scores how strong that signal is for ATS (LinkedIn, GitHub, portfolio, other profiles, keywords,
          content depth, projects).
        </p>
      </div>
      <div className="space-y-3">
        {dimensions.map((d) => (
          <div key={d.id}>
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>{d.label}</span>
              <span className="tabular-nums text-zinc-300">
                {d.score}/100
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 transition-[width] duration-500"
                style={{ width: `${Math.min(100, Math.max(0, d.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
