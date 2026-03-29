import { NextResponse } from "next/server";
import { calculateATSFromText } from "@/lib/ats";

type AnalyzeRequest = {
  text?: string;
  targetRole?: string;
};

function buildHeuristicSuggestions(missingKeywords: string[]): string[] {
  const suggestions = [
    "Use impact-driven bullets in this format: action + metric + business outcome.",
    "Prioritize recent and relevant projects with links to demos or repos.",
    "Keep formatting clean with clear section headings for ATS parsing.",
  ];
  if (missingKeywords.length > 0) {
    suggestions.unshift(`Add these likely missing keywords: ${missingKeywords.slice(0, 8).join(", ")}.`);
  }
  return suggestions;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const text = body.text?.trim() ?? "";
    const targetRole = body.targetRole?.trim() || "Full Stack Developer";

    if (!text) {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }

    const feedback = calculateATSFromText(text, targetRole);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        ...feedback,
        suggestions: buildHeuristicSuggestions(feedback.missingKeywords),
        source: "heuristic",
      });
    }

    const prompt = `
You are an expert resume reviewer.
Given this resume text and role, return strict JSON:
{
  "suggestions": ["..."],
  "improvedSummary": "..."
}
Rules:
- 4 concise ATS-first suggestions
- Include role-specific keywords naturally
- Keep suggestions practical and industry-ready

Role: ${targetRole}
Resume text:
${text.slice(0, 9000)}
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
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        ...feedback,
        suggestions: buildHeuristicSuggestions(feedback.missingKeywords),
        source: "heuristic",
      });
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as {
      suggestions?: string[];
      improvedSummary?: string;
    };

    return NextResponse.json({
      ...feedback,
      suggestions:
        parsed.suggestions && parsed.suggestions.length > 0
          ? parsed.suggestions
          : buildHeuristicSuggestions(feedback.missingKeywords),
      improvedSummary: parsed.improvedSummary ?? "",
      source: "openai",
    });
  } catch {
    return NextResponse.json({ error: "Failed to analyze uploaded resume." }, { status: 500 });
  }
}
