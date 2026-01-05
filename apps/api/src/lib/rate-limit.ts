import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { FastifyRequest } from "fastify";
import { env } from "./env";

type RateLimitConfig = {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
  identifier?: string;
};

export class RateLimitError extends Error {
  public readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const redisClient =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiterCache = new Map<string, Ratelimit>();
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

const getLimiter = (config: RateLimitConfig): Ratelimit | null => {
  if (!redisClient) return null;
  const cacheKey = `${config.keyPrefix}:${config.limit}:${config.windowSeconds}`;
  if (limiterCache.has(cacheKey)) {
    return limiterCache.get(cacheKey)!;
  }
  const limiter = new Ratelimit({
    redis: redisClient,
    prefix: config.keyPrefix,
    limiter: Ratelimit.fixedWindow(config.limit, `${config.windowSeconds} s`),
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
};

const memoryLimit = (
  key: string,
  limit: number,
  windowSeconds: number,
): { success: boolean; reset: number; remaining: number } => {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = memoryStore.get(key);
  if (!existing || existing.expiresAt <= now) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs });
    return { success: true, reset: now + windowMs, remaining: limit - 1 };
  }
  if (existing.count < limit) {
    existing.count += 1;
    return { success: true, reset: existing.expiresAt, remaining: limit - existing.count };
  }
  return { success: false, reset: existing.expiresAt, remaining: 0 };
};

export const enforceRateLimit = async (
  request: FastifyRequest,
  config: RateLimitConfig,
): Promise<{ remaining: number; reset: number }> => {
  const identifier = config.identifier ?? request.ip ?? "unknown";
  const limiter = getLimiter(config);
  const key = `${config.keyPrefix}:${identifier}`;

  if (limiter) {
    const result = await limiter.limit(key);
    if (!result.success) {
      throw new RateLimitError("Too many requests", Math.ceil((result.reset - Date.now()) / 1000));
    }
    return { remaining: result.remaining, reset: result.reset };
  }

  const result = memoryLimit(key, config.limit, config.windowSeconds);
  if (!result.success) {
    throw new RateLimitError("Too many requests", Math.ceil((result.reset - Date.now()) / 1000));
  }
  return { remaining: result.remaining, reset: result.reset };
};
