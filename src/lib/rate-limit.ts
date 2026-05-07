import { LRUCache } from "lru-cache";

/**
 * Simple in-memory rate limiter for serverless environments.
 * Note: In a multi-instance production environment, use Upstash Redis.
 */
export const rateLimit = (options: { interval: number; uniqueTokenPerInterval: number }) => {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000, // En v11 se usa 'ttl' en lugar de 'maxAge'
  });

  return {
    check: (res: any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        res.headers.set("X-RateLimit-Limit", limit.toString());
        res.headers.set("X-RateLimit-Remaining", isRateLimited ? "0" : (limit - currentUsage).toString());

        return isRateLimited ? reject() : resolve();
      }),
  };
};

export const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max users per instance
});
