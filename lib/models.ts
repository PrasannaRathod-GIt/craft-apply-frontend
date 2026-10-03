// Models confirmed available on the current Gemini free-tier API key.
// "gemini-3.5-flash-lite" is the backend's default (set in app/services/gemini.py).
export const MODEL_OPTIONS = [
  { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite (recommended)" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
  { value: "gemini-3.7-flash", label: "Gemini 3.7 Flash" },
  { value: "gemini-3.8-flash", label: "Gemini 3.8 Flash" },
] as const;

export const DEFAULT_MODEL = MODEL_OPTIONS[0].value;