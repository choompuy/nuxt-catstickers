import type { H3Event } from "h3";
import {
    CACHE_TTL,
    RATE_MAX,
    RATE_WINDOW,
    REQUEST_TIMEOUT,
    MAX_RETRIES,
    RETRY_DELAY,
} from "../constants/api";

const cache = new Map<string, { expire: number; data: unknown }>();
const rateLimit = new Map<string, { count: number; last: number }>();
const pending = new Map<string, Promise<unknown>>();

function makeKey(url: string, query?: Record<string, unknown>) {
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

/**
 * Sleep for a specified duration (used for retry delays)
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
    url: string,
    options: {
        query?: Record<string, unknown>;
        headers?: Record<string, string>;
        cache?: boolean;
        ttl?: number;
        timeout?: number;
    } = {},
    event: H3Event
): Promise<T> {
    const key = makeKey(url, options.query);

    const useCache = options.cache !== false;
    const ttl = options.ttl ?? CACHE_TTL;
    const timeout = options.timeout ?? REQUEST_TIMEOUT;

    if (useCache) {
        const cached = getCache(key);
        if (cached) return cached as T;
    }

    if (pending.has(key)) {
        return pending.get(key) as Promise<T>;
    }

    const ip = getRequestIP(event) || "unknown";
    checkRateLimit(ip);

    const fetchWithRetry = async (attempt: number = 1): Promise<T> => {
        try {
            const res = (await $fetch<T>(url, {
                method: "GET",
                query: options.query,
                headers: options.headers,
                timeout,
            })) as T;

            if (useCache) setCache(key, res, ttl);

            return res;
        } catch (err: unknown) {
            const error = err as { statusCode?: number; name?: string; message?: string };

            // Retry on 5xx errors (server errors) and network errors
            const isRetryable =
                (error.statusCode && error.statusCode >= 500 && error.statusCode < 600) ||
                error.name === "TimeoutError" ||
                error.name === "AbortError";

            if (isRetryable && attempt < MAX_RETRIES) {
                console.warn(
                    `API request failed (attempt ${attempt}/${MAX_RETRIES}), retrying...`,
                    error.message
                );
                await sleep(RETRY_DELAY);
                return fetchWithRetry(attempt + 1);
            }

            // Determine error type and message
            let statusCode = 500;
            let statusMessage = "External API Error";

            if (error.name === "TimeoutError" || error.name === "AbortError") {
                statusCode = 408;
                statusMessage = "Request timeout - API did not respond in time";
            } else if (error.statusCode) {
                statusCode = error.statusCode;
                if (statusCode === 404) {
                    statusMessage = "Resource not found";
                } else if (statusCode === 429) {
                    statusMessage = "Too many requests - rate limit exceeded";
                } else if (statusCode >= 400 && statusCode < 500) {
                    statusMessage = "Client error - invalid request";
                } else if (statusCode >= 500) {
                    statusMessage = "Server error - API is unavailable";
                }
            } else {
                statusMessage = "Network error - failed to connect to API";
            }

            throw createError({
                statusCode,
                statusMessage,
            });
        }
    };

    const promise = fetchWithRetry().finally(() => {
        pending.delete(key);
    });

    pending.set(key, promise);

    return promise;
}
