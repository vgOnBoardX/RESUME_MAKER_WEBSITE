"use client";

import Link from "next/link";
import { extractResumeText } from "@/lib/extract-resume-text";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

type AnalysisResult = {
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  suggestions?: string[];
  improvedSummary?: string;
};

function CircularAts({ score }: { score: number }) {
  const size = 130;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div>
        <p className="text-xs uppercase text-zinc-400">ATS Score</p>
        <p className="text-3xl font-bold">{score}/100</p>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.replace("/login");
      }
    };
    void checkAuth();
  }, [router]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setFileLoading(true);
    try {
      const text = await extractResumeText(file);
      if (!text.trim()) {
        setFileError("No readable text found. Try another file or paste below.");
      } else {
        setResumeText(text);
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not read this file.");
    } finally {
      setFileLoading(false);
      event.target.value = "";
    }
  };

  const analyze = async () => {
    setLoading(true);
    const response = await fetch("/api/analyze-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText, targetRole }),
    });
    const data = (await response.json()) as AnalysisResult;
    if (response.ok) {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Upload Resume and Check ATS</h1>
          <div className="flex gap-2 text-sm">
            <Link href="/builder" className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10">
              Builder
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm">
              <span className="text-xs text-zinc-500">{fileLoading ? "Reading file…" : "PDF, Word (.docx), or text"}</span>
              <input
                type="file"
                disabled={fileLoading}
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
                className="text-xs file:mr-2 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1"
              />
            </label>
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role" />
          </div>
          {fileError && <p className="mt-2 text-sm text-amber-400">{fileError}</p>}
          <p className="mt-2 text-xs text-zinc-400">
            Files are read in your browser. Old .doc format: save as .docx or PDF first, or paste text.
          </p>
          <textarea
            className="mt-3 min-h-64 w-full rounded-lg border border-white/10 bg-zinc-800 p-3"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your existing resume here..."
          />
          <button onClick={analyze} disabled={loading || !resumeText.trim()} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {result && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <CircularAts score={result.score} />
            <p className="mt-4 text-sm text-zinc-300">Strengths: {result.strengths.join(" | ") || "N/A"}</p>
            <p className="mt-2 text-sm text-zinc-300">Improvements: {result.improvements.join(" | ") || "N/A"}</p>
            <p className="mt-2 text-sm text-zinc-300">Missing Keywords: {result.missingKeywords.join(", ") || "None"}</p>
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Suggested Changes</h2>
                <ul className="mt-2 space-y-2 text-sm text-zinc-200">
                  {result.suggestions.map((suggestion) => (
                    <li key={suggestion}>- {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.improvedSummary && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Improved Summary</h2>
                <p className="mt-2 text-sm text-zinc-200">{result.improvedSummary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
