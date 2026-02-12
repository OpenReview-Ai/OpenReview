import DB from "../configs/db.config";
import { Repository, CodeReview } from "../types/types";

export class DatabaseService {
  async getRepository(fullName: string): Promise<Repository | null> {
    const repo = await DB.repository.findUnique({
      where: { full_name: fullName },
    });

    return repo;
  }

  async createRepository(
    owner: string,
    name: string,
    webhookSecret?: string,
  ): Promise<Repository> {
    const fullName = `${owner}/${name}`;

    const repo = await DB.repository.create({
      data: {
        owner,
        name,
        full_name: fullName,
        webhook_secret: webhookSecret,
        is_active: true,
      },
    });

    return repo;
  }

  async createCodeReview(review: {
    repository_id: string;
    commit_sha: string;
    commit_message?: string;
    commit_author?: string;
    file_path: string;
    review_comment: string;
    code_diff?: string;
  }): Promise<CodeReview> {
    const codeReview = await DB.codeReview.create({
      data: review,
    });

    return codeReview as CodeReview;
  }

  async updateReviewStatus(
    reviewId: string,
    status: "pending" | "posted" | "failed",
    githubCommentId?: number,
  ): Promise<void> {
    await DB.codeReview.update({
      where: { id: reviewId },
      data: {
        status,
        github_comment_id: githubCommentId
          ? BigInt(githubCommentId)
          : undefined,
      },
    });
  }

  async getRecentReviews(
    repositoryId: string,
    limit = 10,
  ): Promise<CodeReview[]> {
    const reviews = await DB.codeReview.findMany({
      where: { repository_id: repositoryId },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return reviews as CodeReview[];
  }
}
