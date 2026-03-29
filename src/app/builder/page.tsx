"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtsFeedback, ResumeData } from "@/types/resume";

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

function CircularAts({ score }: { score: number }) {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
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
        <p className="text-xs uppercase text-zinc-400">ATS Tracking Score</p>
        <p className="text-3xl font-bold">{score}/100</p>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [ats, setAts] = useState<AtsFeedback | null>(null);
  const [loadingAts, setLoadingAts] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillUrl, setNewSkillUrl] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.replace("/login");
        return;
      }
      setReady(true);
    };
    void checkAuth();
  }, [router]);

  const skillArray = useMemo(
    () =>
      resume.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    [resume.skills]
  );

  const otherLinkArray = useMemo(
    () =>
      resume.otherLinks
        .split(",")
        .map((link) => link.trim())
        .filter(Boolean),
    [resume.otherLinks]
  );

  const updateResume = (field: keyof ResumeData, value: string) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

  const handleAtsCheck = async () => {
    setLoadingAts(true);
    const response = await fetch("/api/ats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });
    const data = (await response.json()) as AtsFeedback;
    setAts(data);
    setLoadingAts(false);
  };

  const handleAIOptimize = async () => {
    setLoadingAi(true);
    const response = await fetch("/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });
    const data = (await response.json()) as Pick<ResumeData, "summary" | "skills" | "experience">;
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
    const normalizedSkill = newSkill.toLowerCase().trim();
    const normalizedUrl = newSkillUrl.trim();
    if (!normalizedSkill || !normalizedUrl) return;
    setResume((prev) => ({
      ...prev,
      skillHubLinks: {
        ...prev.skillHubLinks,
        [normalizedSkill]: normalizedUrl,
      },
    }));
    setNewSkill("");
    setNewSkillUrl("");
  };

  if (!ready) {
    return <main className="min-h-screen bg-zinc-950 p-10 text-zinc-100">Checking session...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <div className="flex gap-2 text-sm">
            <Link href="/dashboard" className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10">
              Dashboard
            </Link>
            <Link href="/analyze" className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10">
              Upload & Analyze
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 backdrop-blur print:hidden">
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2.5 text-base font-medium" value={resume.fullName} onChange={(e) => updateResume("fullName", e.target.value)} placeholder="Full name" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={resume.title} onChange={(e) => updateResume("title", e.target.value)} placeholder="Title" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={resume.email} onChange={(e) => updateResume("email", e.target.value)} placeholder="Email" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={resume.phone} onChange={(e) => updateResume("phone", e.target.value)} placeholder="Phone" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={resume.linkedin} onChange={(e) => updateResume("linkedin", e.target.value)} placeholder="LinkedIn URL" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={resume.github} onChange={(e) => updateResume("github", e.target.value)} placeholder="GitHub URL" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.portfolio} onChange={(e) => updateResume("portfolio", e.target.value)} placeholder="Portfolio Website" />
            <textarea className="min-h-16 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.otherLinks} onChange={(e) => updateResume("otherLinks", e.target.value)} placeholder="Other app/profile links (comma separated)" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.location} onChange={(e) => updateResume("location", e.target.value)} placeholder="Location" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.targetRole} onChange={(e) => updateResume("targetRole", e.target.value)} placeholder="Target role for ATS" />
            <textarea className="min-h-20 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.summary} onChange={(e) => updateResume("summary", e.target.value)} placeholder="Professional summary" />
            <textarea className="min-h-20 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.skills} onChange={(e) => updateResume("skills", e.target.value)} placeholder="Skills (comma separated)" />
            <textarea className="min-h-24 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.experience} onChange={(e) => updateResume("experience", e.target.value)} placeholder="Experience (bullet points)" />
            <textarea className="min-h-16 rounded-lg border border-white/10 bg-zinc-800 p-2 sm:col-span-2" value={resume.education} onChange={(e) => updateResume("education", e.target.value)} placeholder="Education" />
          </div>

          <form onSubmit={addSkillLink} className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skill" />
            <input className="rounded-lg border border-white/10 bg-zinc-800 p-2" value={newSkillUrl} onChange={(e) => setNewSkillUrl(e.target.value)} placeholder="Skill hub URL" />
            <button className="rounded-lg bg-fuchsia-600 px-3 py-2 font-medium hover:bg-fuchsia-500" type="submit">Add Link</button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={handleAIOptimize} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500">{loadingAi ? "Optimizing..." : "AI Optimize Resume"}</button>
            <button onClick={handleAtsCheck} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500">{loadingAts ? "Checking..." : "Run ATS Score"}</button>
          </div>

          {ats && (
            <div className="mt-5 rounded-xl border border-white/10 bg-zinc-800/70 p-4 text-sm">
              <CircularAts score={ats.score} />
              <p className="mt-2 text-zinc-300">Strengths: {ats.strengths.join(" | ") || "N/A"}</p>
              <p className="mt-2 text-zinc-300">Improvements: {ats.improvements.join(" | ") || "N/A"}</p>
              <p className="mt-2 text-zinc-300">Missing Keywords: {ats.missingKeywords.join(", ") || "None"}</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white p-6 text-zinc-900 shadow-2xl print:rounded-none print:border-none print:shadow-none">
          <div className="mb-4 flex justify-end print:hidden">
            <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
              Download Resume (PDF)
            </button>
          </div>
          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{resume.fullName}</h2>
          <p className="mt-1 text-lg text-fuchsia-700 sm:text-xl">{resume.title}</p>
          <p className="mt-2 text-sm text-zinc-600">
            <a href={`mailto:${resume.email}`} className="text-fuchsia-700 hover:underline">{resume.email}</a> | {resume.phone} | {resume.location}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {resume.linkedin && <a href={toExternalUrl(resume.linkedin)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">LinkedIn</a>}
            {resume.github && <a href={toExternalUrl(resume.github)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">GitHub</a>}
            {resume.portfolio && <a href={toExternalUrl(resume.portfolio)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">Portfolio</a>}
            {otherLinkArray.map((link) => (
              <a key={link} href={toExternalUrl(link)} target="_blank" rel="noreferrer" className="text-fuchsia-700 hover:underline">{link}</a>
            ))}
          </div>

          <div className="mt-5"><h3 className="text-lg font-semibold">Summary</h3><p className="mt-1 text-sm leading-6">{resume.summary}</p></div>
          <div className="mt-5">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {skillArray.map((skill) => {
                const url = resume.skillHubLinks[skill.toLowerCase()];
                return url ? (
                  <a key={skill} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-fuchsia-700 hover:border-fuchsia-400">{skill}</a>
                ) : (
                  <span key={skill} className="rounded-full bg-zinc-100 px-3 py-1 text-sm">{skill}</span>
                );
              })}
            </div>
          </div>
          <div className="mt-5"><h3 className="text-lg font-semibold">Experience</h3><div className="mt-2 space-y-1 text-sm">{resume.experience.split("\n").map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div></div>
          <div className="mt-5"><h3 className="text-lg font-semibold">Education</h3><p className="mt-1 text-sm">{resume.education}</p></div>
        </section>
      </div>
    </main>
  );
}
