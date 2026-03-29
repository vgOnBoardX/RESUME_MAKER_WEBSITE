import { AtsFeedback, ProfileDimension, ResumeData } from "@/types/resume";

const ROLE_KEYWORDS: Record<string, string[]> = {
  "frontend developer": [
    "react",
    "typescript",
    "javascript",
    "ui",
    "responsive",
    "performance",
    "testing",
  ],
  "backend developer": [
    "node",
    "api",
    "database",
    "scalable",
    "security",
    "microservices",
    "testing",
  ],
  "full stack developer": [
    "react",
    "node",
    "typescript",
    "api",
    "database",
    "cloud",
    "ci/cd",
    "testing",
  ],
  "data analyst": ["sql", "python", "dashboard", "excel", "statistics", "etl"],
};

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function pickRoleKeywords(targetRole: string): string[] {
  const normalizedRole = normalize(targetRole);
  return (
    ROLE_KEYWORDS[normalizedRole] ??
    ROLE_KEYWORDS["full stack developer"] ??
    []
  );
}

function scoreLinkedInUrl(raw: string): number {
  const s = normalize(raw);
  if (!s) return 0;
  if (s.includes("linkedin.com/in") || s.includes("linkedin.com/company")) return 100;
  if (s.includes("linkedin")) return 75;
  return 50;
}

function scoreGithubUrl(raw: string): number {
  const s = normalize(raw);
  if (!s) return 0;
  if (s.includes("github.com/") && s.split("/").filter(Boolean).length >= 2) return 100;
  if (s.includes("github")) return 70;
  return 45;
}

function scorePortfolioUrl(raw: string): number {
  const s = normalize(raw);
  if (!s) return 0;
  if (s.startsWith("http://") || s.startsWith("https://")) return 95;
  if (s.includes(".") && !s.includes(" ")) return 80;
  return 55;
}

function scoreOtherLinks(raw: string): number {
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return 0;
  if (parts.length === 1) return 45;
  if (parts.length === 2) return 75;
  return 100;
}

function buildProfileDimensionsFromResume(resume: ResumeData, roleKeywords: string[], searchable: string): ProfileDimension[] {
  const keywordCoverage =
    roleKeywords.length > 0
      ? Math.round((roleKeywords.filter((k) => searchable.includes(k)).length / roleKeywords.length) * 100)
      : 60;

  const summaryScore = Math.min(100, Math.round((resume.summary.trim().length / 200) * 100));
  const experienceScore = Math.min(100, Math.round((resume.experience.trim().length / 800) * 100));
  const projectCount = resume.projects.filter((p) => p.name.trim()).length;
  const projectLinkCount = resume.projects.filter((p) => p.url.trim()).length;
  const projectsScore = Math.min(100, projectCount * 25 + projectLinkCount * 15);

  return [
    { id: "linkedin", label: "LinkedIn", score: scoreLinkedInUrl(resume.linkedin) },
    { id: "github", label: "GitHub", score: scoreGithubUrl(resume.github) },
    { id: "portfolio", label: "Portfolio", score: scorePortfolioUrl(resume.portfolio) },
    { id: "profiles", label: "Other profiles", score: scoreOtherLinks(resume.otherLinks) },
    { id: "keywords", label: "Role keywords", score: keywordCoverage },
    { id: "summary", label: "Summary depth", score: summaryScore || 0 },
    { id: "experience", label: "Experience detail", score: experienceScore || 0 },
    { id: "projects", label: "Projects", score: projectsScore },
  ];
}

function buildProfileDimensionsFromText(text: string, targetRole: string): ProfileDimension[] {
  const searchable = normalize(text);
  const roleKeywords = pickRoleKeywords(targetRole);
  const keywordCoverage =
    roleKeywords.length > 0
      ? Math.round((roleKeywords.filter((k) => searchable.includes(k)).length / roleKeywords.length) * 100)
      : 60;

  const hasLinkedIn = searchable.includes("linkedin.com") || searchable.includes("linkedin");
  const hasGithub = searchable.includes("github.com") || searchable.includes("github");
  const hasPortfolioHint =
    searchable.includes("portfolio") ||
    searchable.includes("personal site") ||
    /https?:\/\/[^\s]+\.(dev|io|app|me)/.test(text);
  const linkCount = (text.match(/https?:\/\/[^\s]+/g) ?? []).length;

  return [
    { id: "linkedin", label: "LinkedIn", score: hasLinkedIn ? 100 : 0 },
    { id: "github", label: "GitHub", score: hasGithub ? 100 : searchable.includes("gitlab") ? 80 : 0 },
    { id: "portfolio", label: "Portfolio / site", score: hasPortfolioHint ? 90 : linkCount > 0 ? 60 : 0 },
    { id: "profiles", label: "Links & presence", score: Math.min(100, linkCount * 25) },
    { id: "keywords", label: "Role keywords", score: keywordCoverage },
    { id: "summary", label: "Content length", score: Math.min(100, Math.round((text.trim().length / 1200) * 100)) },
    { id: "experience", label: "Structure signals", score: ["experience", "work", "employment"].some((w) => searchable.includes(w)) ? 85 : 40 },
    { id: "projects", label: "Projects mention", score: searchable.includes("project") ? 80 : 35 },
  ];
}

function buildBestImprovements(
  missingKeywords: string[],
  improvements: string[],
  profileBreakdown: ProfileDimension[]
): string[] {
  const low = profileBreakdown.filter((p) => p.score < 60).map((p) => `Raise "${p.label}" (currently ${p.score}/100).`);
  const keywordLine =
    missingKeywords.length > 0
      ? `Weave in missing keywords naturally: ${missingKeywords.slice(0, 6).join(", ")}.`
      : null;
  const merged = [keywordLine, ...low, ...improvements].filter(Boolean) as string[];
  const unique: string[] = [];
  for (const item of merged) {
    if (!unique.includes(item)) unique.push(item);
  }
  return unique.slice(0, 8);
}

export function calculateATS(resume: ResumeData): AtsFeedback {
  const searchable = normalize(
    [
      resume.summary,
      resume.skills,
      resume.experience,
      resume.education,
      resume.linkedin,
      resume.github,
      resume.portfolio,
      resume.otherLinks,
      resume.projects.map((project) => `${project.description} ${project.techStack}`).join(" "),
    ].join(" ")
  );

  const roleKeywords = pickRoleKeywords(resume.targetRole);
  const matchedKeywords = roleKeywords.filter((keyword) => searchable.includes(keyword));
  const missingKeywords = roleKeywords.filter((keyword) => !searchable.includes(keyword));

  const completionChecks = [
    resume.fullName,
    resume.email,
    resume.phone,
    resume.linkedin,
    resume.github,
    resume.portfolio,
    resume.summary,
    resume.skills,
    resume.experience,
    resume.education,
  ];
  const completionScore =
    (completionChecks.filter((field) => field.trim().length > 0).length / completionChecks.length) * 35;

  const keywordScore = roleKeywords.length > 0 ? (matchedKeywords.length / roleKeywords.length) * 45 : 0;
  const linkCoverage =
    resume.skills
      .split(",")
      .map((skill) => normalize(skill))
      .filter(Boolean)
      .filter((skill) => Boolean(resume.skillHubLinks[skill])).length * 2.5;
  const projectScore = Math.min(20, resume.projects.filter((project) => project.name.trim()).length * 10);

  const score = Math.max(
    0,
    Math.min(100, Math.round(completionScore + keywordScore + Math.min(10, linkCoverage) + projectScore))
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (matchedKeywords.length >= Math.max(3, Math.floor(roleKeywords.length / 2))) {
    strengths.push("Good role-keyword coverage for your target role.");
  } else {
    improvements.push("Add more role-specific keywords in summary, skills, and experience.");
  }

  if (resume.projects.some((project) => project.url.trim().length > 0)) {
    strengths.push("Projects include portfolio links, which boosts recruiter trust.");
  } else {
    improvements.push("Add at least one project link to improve credibility.");
  }

  if (Object.keys(resume.skillHubLinks).length > 0) {
    strengths.push("Skill hub links create strong proof of expertise.");
  } else {
    improvements.push("Attach links for key skills to your skill hub or portfolio.");
  }

  if (resume.summary.trim().length < 120) {
    improvements.push("Expand your professional summary to be more impact-driven.");
  }

  const profileBreakdown = buildProfileDimensionsFromResume(resume, roleKeywords, searchable);
  const bestImprovements = buildBestImprovements(missingKeywords, improvements, profileBreakdown);

  return {
    score,
    strengths,
    improvements,
    missingKeywords,
    profileBreakdown,
    bestImprovements,
  };
}

export function calculateATSFromText(text: string, targetRole: string): AtsFeedback {
  const searchable = normalize(text);
  const roleKeywords = pickRoleKeywords(targetRole);
  const matchedKeywords = roleKeywords.filter((keyword) => searchable.includes(keyword));
  const missingKeywords = roleKeywords.filter((keyword) => !searchable.includes(keyword));

  const sectionHints = ["summary", "experience", "education", "skills", "project"];
  const sectionCoverage =
    (sectionHints.filter((hint) => searchable.includes(hint)).length / sectionHints.length) * 35;
  const keywordScore = roleKeywords.length > 0 ? (matchedKeywords.length / roleKeywords.length) * 55 : 0;
  const score = Math.max(0, Math.min(100, Math.round(sectionCoverage + keywordScore)));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (matchedKeywords.length >= Math.max(3, Math.floor(roleKeywords.length / 2))) {
    strengths.push("Strong keyword alignment for your target role.");
  } else {
    improvements.push("Increase target-role keywords in your summary, skills, and achievements.");
  }

  if (searchable.includes("http")) {
    strengths.push("Resume includes portfolio or project links.");
  } else {
    improvements.push("Add portfolio, GitHub, or LinkedIn links for stronger credibility.");
  }

  if (text.length < 700) {
    improvements.push("Add more measurable achievements with numbers and outcomes.");
  }

  const profileBreakdown = buildProfileDimensionsFromText(text, targetRole);
  const bestImprovements = buildBestImprovements(missingKeywords, improvements, profileBreakdown);

  return {
    score,
    strengths,
    improvements,
    missingKeywords,
    profileBreakdown,
    bestImprovements,
  };
}
