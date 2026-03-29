import { NextResponse } from "next/server";
import { ResumeData } from "@/types/resume";

function heuristicOptimize(resume: ResumeData): Pick<ResumeData, "summary" | "skills" | "experience"> {
  const summary = `Results-driven ${resume.targetRole || "professional"} with hands-on expertise in ${
    resume.skills || "modern tools"
  }. Built measurable impact through product delivery, collaboration, and data-backed iteration. Passionate about high-performance digital experiences and scalable systems.`;

  const experience = resume.experience
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("-") ? line : `- ${line}`))
    .join("\n");

  const prioritizedSkills = resume.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 15)
    .join(", ");

  return {
    summary,
    skills: prioritizedSkills,
    experience,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResumeData;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        source: "heuristic",
        ...heuristicOptimize(body),
      });
    }

    const prompt = `
You are an ATS resume expert.
Optimize this resume for the role "${body.targetRole}".
Return JSON with keys: summary, skills, experience.
- Keep it concise, quantified, and ATS-friendly.
- Preserve truthfulness.
- Use bullet points in experience.

RESUME:
${JSON.stringify(body, null, 2)}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        source: "heuristic",
        ...heuristicOptimize(body),
      });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as Partial<ResumeData>;
    return NextResponse.json({
      source: "openai",
      summary: parsed.summary ?? body.summary,
      skills: parsed.skills ?? body.skills,
      experience: parsed.experience ?? body.experience,
    });
  } catch {
    return NextResponse.json({ error: "Unable to optimize resume." }, { status: 500 });
  }
}
