const cache = new Map<string, { expire: number; data: any }>();
const rateLimit = new Map<string, { count: number; last: number }>();

const CACHE_TTL = 1000 * 60; // 1min
const RATE_WINDOW = 1000 * 2; // 2sec
const RATE_MAX = 20;

function makeKey(url: string, query: any) {
    return url + JSON.stringify(query || {});
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
    rateLimit.set(ip, rl);

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

function setCache(key: string, data: any) {
    cache.set(key, {
        data,
        expire: Date.now() + CACHE_TTL,
    });
}

export async function apiRequest<T>(url: string, options: { query?: any; headers?: any } = {}, event: any): Promise<T> {
    const ip = getRequestIP(event) || "unknown";
    const key = makeKey(url, options.query);

    const cached = getCache(key);
    if (cached) return cached as T;

    checkRateLimit(ip);

    try {
        const result = await $fetch(url, {
            method: "GET",
            query: options.query,
            headers: options.headers,
        });
        const data = result as unknown as T;
        setCache(key, data);
        return data;
    } catch (err: any) {
        throw createError({
            statusCode: err?.statusCode || 500,
            statusMessage: "External API Error",
        });
    }
}
