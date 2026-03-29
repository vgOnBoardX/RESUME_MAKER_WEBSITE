import { NextResponse } from "next/server";
import { calculateATS } from "@/lib/ats";
import { ResumeData } from "@/types/resume";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResumeData;
    const feedback = calculateATS(body);
    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Invalid resume payload." }, { status: 400 });
  }
}
