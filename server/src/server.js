import { getEnv } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createLogger } from "./utils/logger.js";
import { createApp } from "./app.js";
const config = getEnv(); const logger = createLogger(config.LOG_LEVEL); await connectDatabase(config.MONGODB_URI, logger);
const server = createApp({ config, logger }).listen(config.PORT, () => logger.info({ port: config.PORT }, "LINPAL API listening.")); let shuttingDown = false;
async function shutdown(signal) { if (shuttingDown) return; shuttingDown = true; logger.info({ signal }, "Graceful shutdown started."); server.close(async () => { await disconnectDatabase(logger); process.exit(0); }); setTimeout(() => process.exit(1), 10_000).unref(); }
process.on("SIGINT", () => void shutdown("SIGINT")); process.on("SIGTERM", () => void shutdown("SIGTERM"));
