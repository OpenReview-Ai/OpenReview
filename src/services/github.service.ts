import axios from "axios";
import { config } from "../configs/envConfig";
import { FileDiff } from "../types/types";

export class GitHubService {
  private token: string;
  private baseUrl = "https://api.github.com";

  constructor() {
    this.token = config.github.token;
  }

  async getCommitDiff(
    owner: string,
    repo: string,
    sha: string,
  ): Promise<FileDiff[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      return response.data.files || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GitHub API error: ${error.message}`);
      }
      throw error;
    }
  }

  async postCommitComment(
    owner: string,
    repo: string,
    sha: string,
    body: string,
    path?: string,
    position?: number,
  ): Promise<number> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}/comments`,
        {
          body,
          path,
          position,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to post comment: ${error.message}`);
      }
      throw error;
    }
  }

  async validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): Promise<boolean> {
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }
}
