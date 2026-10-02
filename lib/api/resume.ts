import { apiFetch, API_BASE_URL, ApiError } from "./client";

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

/**
 * The backend's /resume/parse endpoint expects multipart/form-data (it uses
 * FastAPI's Form()/File() params, not a JSON body) - so this sends a FormData
 * object as the body directly, rather than using apiFetch's `json` convenience
 * option (which would incorrectly set Content-Type: application/json).
 */
export async function parseResumeText(text: string): Promise<ResumeParseResponse> {
  const formData = new FormData();
  formData.append("text", text);
  return apiFetch<ResumeParseResponse>("/resume/parse", {
    method: "POST",
    body: formData,
  });
}

export async function parseResumeFile(file: File): Promise<ResumeParseResponse> {
  const formData = new FormData();
  formData.append("file", file);
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

/**
 * The backend's /resume/tailor endpoint takes a JSON body (submission_id +
 * job_description), unlike /resume/parse which takes multipart/form-data -
 * so this one uses apiFetch's `json` convenience option correctly.
 */
export async function tailorResume(
  submissionId: number,
  jobDescription: string
): Promise<ResumeTailorResponse> {
  return apiFetch<ResumeTailorResponse>("/resume/tailor", {
    method: "POST",
    json: { submission_id: submissionId, job_description: jobDescription },
  });
}
export async function downloadResume(submissionId: number, fmt: "docx" | "pdf"): Promise<void> {
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