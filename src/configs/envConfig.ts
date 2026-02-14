import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  github: {
    token: process.env.GITHUB_TOKEN || "",
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || "",
  },

  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "deepseek-coder:6.7b",
  },
};

export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!config.github.token) {
    errors.push("GITHUB_TOKEN is required");
  }

  return errors;
}
