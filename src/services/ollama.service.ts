import axios from "axios";
import { env } from "../configs/envConfig";

export class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = env.OLLAMA_BASE_URL;
    this.model = env.OLLAMA_MODEL;
  }

  async generateCodeReview(diff: string, filename: string): Promise<string> {
    try {
      const prompt = this.buildReviewPrompt(diff, filename);

      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
          },
        },
        {
          timeout: 60000,
        },
      );

      return response.data.response.trim();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Ollama API error: ${error.message}`);
      }
      throw error;
    }
  }

  private buildReviewPrompt(diff: string, filename: string): string {
    return `You are an expert code reviewer. Review the following code changes and provide constructive feedback.

    File: ${filename}

    Code Changes:
    ${diff}

    Please provide:
    1. Potential bugs or issues
    2. Code quality improvements
    3. Best practices suggestions
    4. Security concerns if any

    Keep your review concise and actionable. Focus on the most important issues.`;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000,
      });

      const models = response.data.models || [];
      const modelExists = models.some((m: any) => m.name === this.model);

      if (!modelExists) {
        console.warn(
          `Model ${this.model} not found. Available models:`,
          models.map((m: any) => m.name),
        );
      }

      return true;
    } catch (error) {
      console.error("Failed to connect to Ollama:", error);
      return false;
    }
  }
}
