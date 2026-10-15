import type { H3Event } from "h3";

const cache = new Map<string, { expire: number; data: unknown }>();
const rateLimit = new Map<string, { count: number; last: number }>();
const pending = new Map<string, Promise<unknown>>();

const CACHE_TTL = 1000 * 60 * 60 * 24; // 1 day
const RATE_WINDOW = 1000 * 2; // 2sec
const RATE_MAX = 20;

function makeKey(url: string, query: Record<string, unknown>) {
    const sorted = query
        ? Object.keys(query)
              .sort()
              .map((k) => `${k}=${query[k]}`)
              .join("&")
        : "";

    return `${url}?${sorted}`;
}

// Rate Limit
function checkRateLimit(ip: string) {
    const now = Date.now();
    const rl = rateLimit.get(ip);

    if (!rl) {
        rateLimit.set(ip, { count: 1, last: now });
        return;
    }

    if (now - rl.last > RATE_WINDOW) {
        rl.count = 1;
        rl.last = now;
        rateLimit.set(ip, rl);
        return;
    }

    rl.count++;

    if (rl.count > RATE_MAX) {
        throw createError({
            statusCode: 429,
            statusMessage: "Too Many Requests",
        });
    }
}

// Cache
function getCache(key: string) {
    const item = cache.get(key);
    if (!item) return null;
    if (item.expire < Date.now()) {
        cache.delete(key);
        return null;
    }
    return item.data;
}

function setCache(key: string, data: unknown, ttl: number = CACHE_TTL) {
    cache.set(key, {
        data,
        expire: Date.now() + ttl,
    });
}

export async function apiRequest<T>(
    url: string,
    options: {
        query?: Record<string, unknown>;
        headers?: Record<string, string>;
        cache?: boolean;
        ttl?: number;
    } = {},
    event: H3Event
): Promise<T> {
    const key = makeKey(url, options.query);

    const useCache = options.cache !== false;
    const ttl = options.ttl ?? CACHE_TTL;

    if (useCache) {
        const cached = getCache(key);
        if (cached) return cached as T;
    }

    if (pending.has(key)) {
        return pending.get(key) as Promise<T>;
    }

    const ip = getRequestIP(event) || "unknown";
    checkRateLimit(ip);

    const promise = $fetch<T>(url, {
        method: "GET",
        query: options.query,
        headers: options.headers,
    })
        .then((res) => {
            const data = res as T;

            if (useCache) setCache(key, data, ttl);

            return data;
        })
        .catch((err: unknown) => {
            throw createError({
                statusCode: (err as { statusCode?: number })?.statusCode || 500,
                statusMessage: "External API Error",
            });
        })
        .finally(() => {
            pending.delete(key);
        });

    pending.set(key, promise);

    return promise;
}
