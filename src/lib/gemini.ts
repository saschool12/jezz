export const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"] as const;

export function geminiUrl(model: string, stream = true) {
  const action = stream ? "streamGenerateContent" : "generateContent";
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${encodeURIComponent(process.env.GEMINI_API_KEY || "")}${stream ? "&alt=sse" : ""}`;
}
