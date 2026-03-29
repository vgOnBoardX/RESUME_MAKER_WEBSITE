"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { AtsDashboardPlaceholder } from "@/components/ats/AtsDashboardPlaceholder";
import { CircularAtsGauge } from "@/components/ats/CircularAtsGauge";
import { ProfileDimensionChart } from "@/components/ats/ProfileDimensionChart";
import { extractResumeText } from "@/lib/extract-resume-text";
import type { AtsFeedback, ResumeData } from "@/types/resume";

const initialResume: ResumeData = {
  fullName: "Alex Carter",
  title: "Full Stack Developer",
  email: "alex@email.com",
  phone: "+1 555 458 9921",
  location: "Remote",
  linkedin: "linkedin.com/in/alexcarter",
  github: "github.com/alexcarter",
  portfolio: "alexcarter.dev",
  otherLinks: "leetcode.com/alexcarter, behance.net/alexcarter",
  summary:
    "Product-focused full stack developer passionate about high-performing web apps, clean architecture, and user-first design.",
  skills: "React, TypeScript, Node.js, Next.js, PostgreSQL, Tailwind CSS",
  experience:
    "- Built and shipped scalable features that improved user retention by 26%.\n- Collaborated with design and product teams to improve conversion funnels.\n- Reduced API latency by 38% through backend optimization.",
  education: "B.Tech in Computer Science - 2024",
  targetRole: "Full Stack Developer",
  projects: [
    {
      name: "CreatorOS",
      description: "AI workflow dashboard for creators.",
      techStack: "Next.js, Prisma, PostgreSQL",
      url: "https://example.com",
    },
  ],
  skillHubLinks: {
    react: "https://react.dev",
    typescript: "https://www.typescriptlang.org",
    "node.js": "https://nodejs.org",
  },
};

function toExternalUrl(value: string): string {
  if (!value.trim()) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

type UploadExtra = {
  suggestions?: string[];
  improvedSummary?: string;
  source?: string;
};

function ResumePreview({
  resume,
  skillArray,
  otherLinkArray,
  className = "",
}: {
  resume: ResumeData;
  skillArray: string[];
  otherLinkArray: string[];
  className?: string;
}) {
  return (
    <div className={`resume-print rounded-2xl border border-white/10 bg-white p-6 text-zinc-900 shadow-xl print:border-0 print:shadow-none ${className}`}>
      <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{resume.fullName}</h2>
      <p className="mt-1 text-lg text-fuchsia-700 sm:text-xl">{resume.title}</p>
      <p className="mt-2 text-sm text-zinc-600">
        <a href={`mailto:${resume.email}`} className="text-fuchsia-700 hover:underline">
          {resume.email}
        </a>{" "}
        | {resume.phone} | {resume.location}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {resume.linkedin && (
          <a href={toExternalUrl(resume.linkedin)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">
            LinkedIn
          </a>
        )}
        {resume.github && (
          <a href={toExternalUrl(resume.github)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">
            GitHub
          </a>
        )}
        {resume.portfolio && (
          <a href={toExternalUrl(resume.portfolio)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">
            Portfolio
          </a>
        )}
        {otherLinkArray.map((link) => (
          <a key={link} href={toExternalUrl(link)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">
            {link}
          </a>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Summary</h3>
        <p className="mt-1 text-sm leading-relaxed">{resume.summary}</p>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Skills</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {skillArray.map((skill) => {
            const url = resume.skillHubLinks[skill.toLowerCase()];
            return url ? (
              <a key={skill} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs text-fuchsia-700">
                {skill}
              </a>
            ) : (
              <span key={skill} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs">
                {skill}
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Experience</h3>
        <div className="mt-1 space-y-1 text-sm">
          {resume.experience.split("\n").map((line, i) => (
            <p key={`${i}-${line.slice(0, 20)}`}>{line}</p>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Education</h3>
        <p className="text-sm">{resume.education}</p>
      </div>
    </div>
  );
}

export function ResumeStudio() {
  const [tab, setTab] = useState<"build" | "upload">("build");
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [uploadText, setUploadText] = useState("");
  const [uploadRole, setUploadRole] = useState("Full Stack Developer");

  const [insight, setInsight] = useState<(AtsFeedback & UploadExtra) | null>(null);
  const [insightSource, setInsightSource] = useState<"builder" | "upload" | null>(null);
  const [loadingBuild, setLoadingBuild] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [newSkill, setNewSkill] = useState("");
  const [newSkillUrl, setNewSkillUrl] = useState("");

  const skillArray = useMemo(
    () =>
      resume.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [resume.skills]
  );

  const otherLinkArray = useMemo(
    () =>
      resume.otherLinks
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
    [resume.otherLinks]
  );

  const updateResume = (field: keyof ResumeData, value: string) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

  const runBuilderAts = async () => {
    setLoadingBuild(true);
    const res = await fetch("/api/ats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });
    const data = (await res.json()) as AtsFeedback;
    setInsight(data);
    setInsightSource("builder");
    setLoadingBuild(false);
    document.getElementById("ats-dashboard")?.scrollIntoView({ behavior: "smooth" });
  };

  const runUploadAnalyze = async () => {
    setLoadingUpload(true);
    const res = await fetch("/api/analyze-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: uploadText, targetRole: uploadRole }),
    });
    const data = (await res.json()) as AtsFeedback & UploadExtra;
    if (res.ok) {
      setInsight(data);
      setInsightSource("upload");
    }
    setLoadingUpload(false);
    document.getElementById("ats-dashboard")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAIOptimize = async () => {
    setLoadingAi(true);
    const res = await fetch("/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });
    const data = (await res.json()) as Pick<ResumeData, "summary" | "skills" | "experience">;
    setResume((prev) => ({
      ...prev,
      summary: data.summary ?? prev.summary,
      skills: data.skills ?? prev.skills,
      experience: data.experience ?? prev.experience,
    }));
    setLoadingAi(false);
  };

  const addSkillLink = (event: FormEvent) => {
    event.preventDefault();
    const skill = newSkill.toLowerCase().trim();
    const url = newSkillUrl.trim();
    if (!skill || !url) return;
    setResume((prev) => ({
      ...prev,
      skillHubLinks: { ...prev.skillHubLinks, [skill]: url },
    }));
    setNewSkill("");
    setNewSkillUrl("");
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setFileLoading(true);
    try {
      const text = await extractResumeText(file);
      if (!text.trim()) {
        setFileError("No readable text found in this file. Try another export or paste the text below.");
      } else {
        setUploadText(text);
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not read this file.");
    } finally {
      setFileLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col">
      <section className="border-b border-white/10 bg-gradient-to-b from-zinc-900/50 to-zinc-950 px-4 py-10 print:hidden sm:px-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">Resume Studio</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Build a new resume or upload an existing one
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
            Top: build your resume or upload an existing file. Bottom: circular ATS score, profile bar graph (LinkedIn,
            portfolio, etc.), and ranked improvements to maximize your score.
          </p>
          <nav className="mx-auto mt-6 flex flex-wrap justify-center gap-3 text-sm" aria-label="Page sections">
            <Link
              href="/dashboard"
              className="rounded-full border border-fuchsia-500/40 bg-fuchsia-950/30 px-4 py-2 text-fuchsia-200 hover:bg-fuchsia-950/50"
            >
              Dashboard
            </Link>
            <a href="#resume-workspace" className="rounded-full border border-white/15 px-4 py-2 text-zinc-300 hover:bg-white/10">
              Resume & upload
            </a>
            <a href="#ats-dashboard" className="rounded-full border border-white/15 px-4 py-2 text-zinc-300 hover:bg-white/10">
              ATS score & graph
            </a>
          </nav>
        </div>
      </section>

      <section id="resume-workspace" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-8 print:hidden sm:px-6">
        <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-zinc-900/40 p-1">
          <button
            type="button"
            onClick={() => setTab("build")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === "build" ? "bg-fuchsia-600 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Make resume
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === "upload" ? "bg-cyan-600 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Upload existing resume
          </button>
        </div>

        {tab === "build" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 print:hidden">
              <h2 className="text-lg font-semibold text-white">Your details</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2.5 text-base font-medium" value={resume.fullName} onChange={(e) => updateResume("fullName", e.target.value)} placeholder="Full name" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={resume.title} onChange={(e) => updateResume("title", e.target.value)} placeholder="Title" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={resume.email} onChange={(e) => updateResume("email", e.target.value)} placeholder="Email" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={resume.phone} onChange={(e) => updateResume("phone", e.target.value)} placeholder="Phone" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={resume.linkedin} onChange={(e) => updateResume("linkedin", e.target.value)} placeholder="LinkedIn" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={resume.github} onChange={(e) => updateResume("github", e.target.value)} placeholder="GitHub" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.portfolio} onChange={(e) => updateResume("portfolio", e.target.value)} placeholder="Portfolio URL" />
                <textarea className="min-h-14 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.otherLinks} onChange={(e) => updateResume("otherLinks", e.target.value)} placeholder="Other profiles (comma separated)" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.location} onChange={(e) => updateResume("location", e.target.value)} placeholder="Location" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.targetRole} onChange={(e) => updateResume("targetRole", e.target.value)} placeholder="Target role (ATS)" />
                <textarea className="min-h-20 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.summary} onChange={(e) => updateResume("summary", e.target.value)} placeholder="Summary" />
                <textarea className="min-h-16 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.skills} onChange={(e) => updateResume("skills", e.target.value)} placeholder="Skills (comma separated)" />
                <textarea className="min-h-28 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.experience} onChange={(e) => updateResume("experience", e.target.value)} placeholder="Experience" />
                <textarea className="min-h-14 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2 text-sm" value={resume.education} onChange={(e) => updateResume("education", e.target.value)} placeholder="Education" />
              </div>
              <form onSubmit={addSkillLink} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skill" />
                <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={newSkillUrl} onChange={(e) => setNewSkillUrl(e.target.value)} placeholder="Proof link" />
                <button type="submit" className="rounded-lg bg-fuchsia-600 px-3 py-2 text-sm font-medium hover:bg-fuchsia-500">
                  Link
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleAIOptimize} disabled={loadingAi} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500 disabled:opacity-60">
                  {loadingAi ? "Optimizing…" : "AI optimize"}
                </button>
                <button type="button" onClick={runBuilderAts} disabled={loadingBuild} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-60">
                  {loadingBuild ? "Scoring…" : "Run ATS on builder"}
                </button>
                <button type="button" onClick={() => window.print()} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
                  Download PDF
                </button>
              </div>
            </div>

            <ResumePreview resume={resume} skillArray={skillArray} otherLinkArray={otherLinkArray} />
          </div>
        )}

        {tab === "upload" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 print:hidden">
            <h2 className="text-lg font-semibold text-white">Upload or paste resume</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Choose a PDF, Word (.docx), or text file from your computer — text is extracted in the browser.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer flex-col gap-1 rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm">
                <span className="text-xs text-zinc-400">{fileLoading ? "Reading file…" : "Choose file"}</span>
                <input
                  type="file"
                  disabled={fileLoading}
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFile}
                  className="text-xs file:mr-2 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1"
                />
              </label>
              <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 text-sm" value={uploadRole} onChange={(e) => setUploadRole(e.target.value)} placeholder="Target role" />
            </div>
            {fileError && <p className="mt-2 text-sm text-amber-400">{fileError}</p>}
            <p className="mt-2 text-xs text-zinc-500">
              Legacy Word .doc is not readable here — save as .docx or PDF, or paste the text below.
            </p>
            <textarea
              className="mt-3 min-h-56 w-full rounded-lg border border-white/10 bg-zinc-800 p-3 text-sm text-zinc-100"
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste full resume text here…"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runUploadAnalyze}
                disabled={loadingUpload || !uploadText.trim()}
                className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingUpload ? "Analyzing…" : "Analyze & score upload"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-white/20 px-4 py-2.5 text-sm hover:bg-white/10"
              >
                Download PDF (builder preview)
              </button>
            </div>
          </div>
        )}

        {tab === "upload" && (
          <div className="hidden print:block">
            <ResumePreview resume={resume} skillArray={skillArray} otherLinkArray={otherLinkArray} />
          </div>
        )}
      </section>

      <section
        id="ats-dashboard"
        className="scroll-mt-24 border-t border-white/10 bg-zinc-900/30 px-4 py-12 print:hidden sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-white">ATS score & profile breakdown</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-500">
            Circular tracker for your overall ATS fit, plus a graph of each profile signal (LinkedIn, GitHub,
            portfolio, keywords, and more). Below that: the best changes to pursue first.
          </p>

          {!insight && (
            <>
              <p className="mt-8 text-center text-sm text-zinc-400">
                No score yet — use <strong className="text-zinc-300">Run ATS on builder</strong> or{" "}
                <strong className="text-zinc-300">Analyze &amp; score upload</strong> in the section above.
              </p>
              <AtsDashboardPlaceholder />
            </>
          )}

          {insight && (
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/80 p-8 lg:items-start">
                <CircularAtsGauge score={insight.score} label={insightSource === "upload" ? "Upload ATS score" : "Builder ATS score"} />
                {insightSource && (
                  <p className="mt-4 text-xs text-zinc-500">
                    Source: <span className="text-zinc-300">{insightSource === "upload" ? "Uploaded resume" : "Resume builder"}</span>
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
                <ProfileDimensionChart dimensions={insight.profileBreakdown ?? []} />
              </div>
            </div>
          )}

          {insight && (
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6">
                <h3 className="text-lg font-semibold text-emerald-300">Best improvements for a higher ATS score</h3>
                <p className="mt-1 text-xs text-emerald-200/70">Tackle these first — they move your score the most.</p>
                <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-zinc-300">
                  {(insight.bestImprovements ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
                <h3 className="font-semibold text-zinc-200">Detailed feedback</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  <span className="font-medium text-zinc-300">Strengths:</span> {insight.strengths.join(" · ") || "—"}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  <span className="font-medium text-zinc-300">Gaps:</span> {insight.improvements.join(" · ") || "—"}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  <span className="font-medium text-zinc-300">Missing keywords:</span>{" "}
                  {insight.missingKeywords.length ? insight.missingKeywords.join(", ") : "None flagged"}
                </p>
              </div>
            </div>
          )}

          {insight?.suggestions && insight.suggestions.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-fuchsia-500/20 bg-fuchsia-950/20 p-6">
              <h3 className="font-semibold text-fuchsia-200">AI suggestions (upload)</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {insight.suggestions.map((s) => (
                  <li key={s}>- {s}</li>
                ))}
              </ul>
              {insight.improvedSummary ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs font-medium uppercase text-zinc-500">Suggested summary</p>
                  <p className="mt-1 text-sm text-zinc-300">{insight.improvedSummary}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
