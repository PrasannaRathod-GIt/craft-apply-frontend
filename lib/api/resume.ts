import { apiFetch } from "./client";

export interface ResumeData {
  name: string;
  title: string;
  summary: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string | null;
    website: string | null;
  };
  experiences: {
    role: string;
    company: string;
    location: string | null;
    start_date: string;
    end_date: string;
    bullets: string[];
  }[];
  education: { degree: string; institution: string; year: string; details: string | null }[];
  projects: { name: string; description: string; tech_stack: string[]; link: string | null }[];
  certificates: { name: string; issuer: string; year: string | null }[];
  achievements: { description: string; date: string | null }[];
  skills: string[];
  languages: string[];
  profile_photo_url: string | null;
}

export interface ResumeParseResponse {
  submission_id: number;
  data: ResumeData;
}

export async function parseResumeText(text: string, model?: string): Promise<ResumeParseResponse> {
  const formData = new FormData();
  formData.append("text", text);
  if (model) formData.append("model", model);
  return apiFetch<ResumeParseResponse>("/resume/parse", {
    method: "POST",
    body: formData,
  });
}

export async function parseResumeFile(file: File, model?: string): Promise<ResumeParseResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (model) formData.append("model", model);
  return apiFetch<ResumeParseResponse>("/resume/parse", {
    method: "POST",
    body: formData,
  });
}

export interface ResumeTailorResponse {
  submission_id: number;
  parent_submission_id: number;
  data: ResumeData;
  match_notes: string;
}

export async function tailorResume(
  submissionId: number,
  jobDescription: string,
  model?: string
): Promise<ResumeTailorResponse> {
  return apiFetch<ResumeTailorResponse>("/resume/tailor", {
    method: "POST",
    json: { submission_id: submissionId, job_description: jobDescription, model },
  });
}

export async function downloadResume(submissionId: number, fmt: "docx" | "pdf"): Promise<void> {
  const { API_BASE_URL, ApiError } = await import("./client");
  const res = await fetch(`${API_BASE_URL}/resume/${submissionId}/export/${fmt}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new ApiError(res.status, null, `Export failed with status ${res.status}`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  a.download = match ? match[1] : `resume.${fmt}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}