import { OllamaService } from "./ollama.service";
import { GitHubService } from "./github.service";
import { DatabaseService } from "./database.service";
import { GitHubCommit } from "../types/types";

export class ReviewService {
  private ollamaService: OllamaService;
  private githubService: GitHubService;
  private dbService: DatabaseService;

  constructor() {
    this.ollamaService = new OllamaService();
    this.githubService = new GitHubService();
    this.dbService = new DatabaseService();
  }

  async processCommit(
    owner: string,
    repo: string,
    commit: GitHubCommit,
  ): Promise<void> {
    const fullName = `${owner}/${repo}`;

    let repository = await this.dbService.getRepository(fullName);
    if (!repository) {
      repository = await this.dbService.createRepository(owner, repo);
    }

    if (!repository.is_active) {
      console.log(`Repository ${fullName} is not active, skipping review`);
      return;
    }

    try {
      const files = await this.githubService.getCommitDiff(
        owner,
        repo,
        commit.id,
      );

      const reviewPromises = files
        .filter((file) => file.patch)
        .filter((file) => this.shouldReviewFile(file.filename))
        .map((file) =>
          this.reviewFile(repository.id, commit, file, owner, repo),
        );

      await Promise.all(reviewPromises);

      console.log(`Completed review for commit ${commit.id}`);
    } catch (error) {
      console.error(`Failed to process commit ${commit.id}:`, error);
      throw error;
    }
  }

  private async reviewFile(
    repositoryId: string,
    commit: GitHubCommit,
    file: any,
    owner: string,
    repo: string,
  ): Promise<void> {
    try {
      const reviewComment = await this.ollamaService.generateCodeReview(
        file.patch,
        file.filename,
      );

      const review = await this.dbService.createCodeReview({
        repository_id: repositoryId,
        commit_sha: commit.id,
        commit_message: commit.message,
        commit_author: commit.author.name,
        file_path: file.filename,
        review_comment: reviewComment,
        code_diff: file.patch,
      });

      try {
        const commentBody = `## Code Review for \`${file.filename}\`\n\n${reviewComment}\n\n---\n*Reviewed by OpenReview AI*`;

        const commentId = await this.githubService.postCommitComment(
          owner,
          repo,
          commit.id,
          commentBody,
          file.filename,
        );

        await this.dbService.updateReviewStatus(review.id, "posted", commentId);
        console.log(
          `Posted review for ${file.filename} on commit ${commit.id}`,
        );
      } catch (error) {
        console.error(`Failed to post comment for ${file.filename}:`, error);
        await this.dbService.updateReviewStatus(review.id, "failed");
      }
    } catch (error) {
      console.error(`Failed to review file ${file.filename}:`, error);
      throw error;
    }
  }

  private shouldReviewFile(filename: string): boolean {
    const excludedExtensions = [
      ".json",
      ".md",
      ".txt",
      ".lock",
      ".yaml",
      ".yml",
      ".svg",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
    ];
    const excludedPaths = [
      "package-lock.json",
      "yarn.lock",
      "node_modules",
      "dist",
      "build",
    ];

    const hasExcludedExtension = excludedExtensions.some((ext) =>
      filename.endsWith(ext),
    );
    const hasExcludedPath = excludedPaths.some((path) =>
      filename.includes(path),
    );

    return !hasExcludedExtension && !hasExcludedPath;
  }

  async checkServices(): Promise<{
    ollama: boolean;
    github: boolean;
    database: boolean;
  }> {
    const ollamaConnected = await this.ollamaService.checkConnection();

    let githubConnected = false;
    try {
      await this.githubService.getCommitDiff(
        "octocat",
        "Hello-World",
        "master",
      );
      githubConnected = true;
    } catch (error) {
      console.error("GitHub connection check failed:", error);
    }

    let databaseConnected = false;
    try {
      await this.dbService.getRepository("test/test");
      databaseConnected = true;
    } catch (error) {
      console.error("Database connection check failed:", error);
    }

    return {
      ollama: ollamaConnected,
      github: githubConnected,
      database: databaseConnected,
    };
  }
}
