import OpenAI from "openai";
import config from "../../../config.ts";

export function openai() {
  if (!config.external.openai.apiKey) {
    throw new Error("OPENAI_API_KEY not set!");
  }

  const openai = new OpenAI({
    apiKey: config.external.openai.apiKey,
  });

  return openai;
}
