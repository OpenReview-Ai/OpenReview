import dotenv from "dotenv";
import { EnvConfig } from "../types/types";

dotenv.config();

function getEnvVariable(key: any, required = true): any {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value as string;
}

export const env: EnvConfig = {
  PORT: getEnvVariable("PORT"),
  DATABASE_URL: getEnvVariable("DATABASE_URL"),
  GITHUB_TOKEN: getEnvVariable("GITHUB_TOKEN"),
  GITHUB_WEBHOOK_SECRET: getEnvVariable("GITHUB_WEBHOOK_SECRET"),
  OLLAMA_BASE_URL: getEnvVariable("OLLAMA_BASE_URL"),
  OLLAMA_MODEL: getEnvVariable("OLLAMA_MODEL"),
};
