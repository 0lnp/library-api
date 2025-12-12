import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../configs/app_config";
import { createClientPool } from "redis";
import { type Logger } from "@nestjs/common";

export const redisPool = (
  config: ConfigService<AppConfig, true>,
  logger: Logger,
): ReturnType<typeof createClientPool> => {
  const host = config.get("REDIS_HOST", { infer: true });
  const port = config.get("REDIS_PORT", { infer: true });
  const password = config.get("REDIS_PASSWORD", { infer: true });
  const database = config.get("REDIS_DATABASE", { infer: true });

  const pool = createClientPool({
    url: `redis://${host}:${port}`,
    password,
    database,
  });

  pool.on("error", (error: unknown) => {
    if (error instanceof AggregateError) {
      error.errors.forEach((err: Error) => {
        logger.error(`[REDIS ERROR]: ${err.message}`);
      });
    } else {
      logger.error(`[REDIS ERROR]: ${error}`);
    }
  });

  pool.connect();

  return pool;
};
