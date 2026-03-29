export type ResumeProject = {
  name: string;
  description: string;
  techStack: string;
  url: string;
};

export type ResumeData = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  otherLinks: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  projects: ResumeProject[];
  targetRole: string;
  skillHubLinks: Record<string, string>;
};

export type ProfileDimension = {
  id: string;
  label: string;
  score: number;
};

export type AtsFeedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  profileBreakdown: ProfileDimension[];
  bestImprovements: string[];
};
