import Fastify from "fastify";
import dotenv from "dotenv";
import { initSentry, captureException, captureMessage } from "./lib/sentry";

dotenv.config();
initSentry();

const app = Fastify({ logger: true });

// Health check
app.get("/health", async () => {
  return {
    ok: true,
    service: "eventora-api",
    timestamp: new Date().toISOString(),
  };
});

// Sentry test endpoint
app.get("/test-sentry", async () => {
  captureMessage("🧪 Test message from Eventora API", "info");
  
  try {
    throw new Error("🔥 Test error from Eventora API - This is intentional!");
  } catch (error) {
    captureException(error as Error, {
      testContext: true,
      endpoint: "/test-sentry",
      timestamp: new Date().toISOString(),
    });
    throw error; // Re-throw to see in logs too
  }
});

const start = async () => {
  try {
    await app.listen({ port: 4000, host: "0.0.0.0" });
    app.log.info(`API listening on http://localhost:4000`);
  } catch (err) {
    app.log.error({ err }, "Failed to start API");
    process.exit(1);
  }
};

void start();
