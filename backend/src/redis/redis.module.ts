import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import { createInMemoryRedisClient } from "./in-memory-redis.client";

function resolveSessionStore(configService: ConfigService): string {
  return (configService.get<string>("SESSION_STORE") ?? "")
    .trim()
    .toLowerCase();
}

function createRedisClient(configService: ConfigService): Redis {
  const logger = new Logger("RedisModule");
  const redisUrl = configService.get<string>("REDIS_URL")?.trim();
  const client = redisUrl
    ? new Redis(redisUrl, { maxRetriesPerRequest: null })
    : new Redis({
        host: configService.get<string>("REDIS_HOST") || "localhost",
        port: configService.get<number>("REDIS_PORT") || 6379,
        maxRetriesPerRequest: null,
      });
  client.on("error", (err: Error) => {
    logger.error(
      `Redis connection error: ${err.message}. Start Redis (docker compose up -d redis) or set SESSION_STORE=memory for local dev.`,
    );
  });
  return client;
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "REDIS_CLIENT",
      useFactory: (configService: ConfigService) => {
        if (resolveSessionStore(configService) === "memory") {
          new Logger("RedisModule").warn(
            "SESSION_STORE=memory — using in-memory catalog cache (no Redis connection).",
          );
          return createInMemoryRedisClient();
        }
        return createRedisClient(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
