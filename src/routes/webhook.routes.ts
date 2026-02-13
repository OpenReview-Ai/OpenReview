import { Router, Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import { GitHubWebhookPayload } from "../types/types";

const router = Router();
const reviewService = new ReviewService();

router.post("/webhook/github", async (req: Request, res: Response) => {
  try {
    const event = req.headers["x-github-event"] as string;

    if (event !== "push") {
      return res.status(200).json({ message: "Event ignored" });
    }

    const payload: GitHubWebhookPayload = req.body;

    if (!payload.commits || payload.commits.length === 0) {
      return res.status(200).json({ message: "No commits to review" });
    }

    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;

    console.log(
      `Received push event for ${owner}/${repo} with ${payload.commits.length} commits`,
    );

    res.status(202).json({ message: "Review started" });

    for (const commit of payload.commits) {
      await reviewService.processCommit(owner, repo, commit);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
