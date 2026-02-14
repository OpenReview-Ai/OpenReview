import express, { Express } from "express";
import { env } from "./configs/envConfig";
import webhookRoutes from "./routes/webhook.routes";
import healthRoutes from "./routes/health.routes";

const app: Express = express();

app.use(express.json());

app.use(healthRoutes);
app.use(webhookRoutes);

function startServer() {
  const port = env.PORT;

  app.listen(port, () => {
    console.log("\nOpenReview Server Started");
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Webhook endpoint: http://localhost:${port}/webhook/github`);
    console.log("\nWaiting for GitHub webhook events...\n");
  });
}

startServer();
