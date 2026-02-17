import { Router, Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import { GitHubWebhookPayload } from "../types/types";
import { WebhookController } from "../controllers/webhook.controller";

const webhookRouter = Router();
const webhookController = new WebhookController();

webhookRouter.post("/webhook/github", webhookController.webhook);

export default webhookRouter;
