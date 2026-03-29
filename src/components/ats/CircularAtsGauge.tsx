"use client";

import { useId } from "react";

type Props = {
  score: number;
  label?: string;
  size?: number;
  stroke?: number;
};

export function CircularAtsGauge({ score, label = "ATS score", size = 160, stroke = 12 }: Props) {
  const gradId = useId().replace(/:/g, "");
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-6">
      <svg width={size} height={size} className="-rotate-90 shrink-0" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="text-4xl font-bold tabular-nums text-zinc-100">{score}</p>
        <p className="text-sm text-zinc-500">out of 100</p>
      </div>
    </div>
  );
}
