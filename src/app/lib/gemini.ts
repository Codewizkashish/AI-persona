import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAiClient() {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: getRequiredEnv("GEMINI_API_KEY"),
    });
  }

  return ai;
}
