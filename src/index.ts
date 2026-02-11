import express, { Express } from "express";
import { config, validateConfig } from "./config";
import webhookRoutes from "./routes/webhook.routes";
import healthRoutes from "./routes/health.routes";

const app: Express = express();

app.use(express.json());

app.use(healthRoutes);
app.use(webhookRoutes);

function startServer() {
  const configErrors = validateConfig();

  if (configErrors.length > 0) {
    console.error("Configuration errors:");
    configErrors.forEach((error) => console.error(`  - ${error}`));
    console.error(
      "\nPlease check your .env file and ensure all required variables are set.",
    );
    process.exit(1);
  }

  const port = config.port;

  app.listen(port, () => {
    console.log("\nOpenReview Server Started");
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Webhook endpoint: http://localhost:${port}/webhook/github`);
    console.log("\nWaiting for GitHub webhook events...\n");
  });
}

startServer();
