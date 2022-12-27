import { Redis } from "@upstash/redis";

const isRedisConfigEnabled = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redisPool: { [key: string]: Redis } = {};

export function getRedisInstance(key = "default"): Redis {
  let ins = redisPool[key];
  if (!ins) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      redisPool[key] = ins = new Redis({ url, token });
    } else {
      throw new Error("Missing url and token");
    }
  }
  return ins;
}

export async function executeOrLoadFromRedis<T>(
  methodKey: string,
  methodPromise: Promise<T>
): Promise<T> {
  if (!isRedisConfigEnabled) {
    return await methodPromise;
  }

  const redis = getRedisInstance();
  const redisKey = `CHALLENGE_SERVICE_CACHE:KEY_VALUE:${methodKey}`;
  const cacheResult = await redis.get<string>(redisKey);

  let result: T;
  if (!cacheResult) {
    result = await methodPromise;
    await redis.set<string>(
      redisKey,
      typeof result === "string" ? result : JSON.stringify(result),
      { ex: 1800 } /* ex: half a hour */
    );
  } else {
    try {
      result = JSON.parse(cacheResult) as T;
    } catch (err) {
      result = cacheResult as T;
    }
  }
  return result;
}
