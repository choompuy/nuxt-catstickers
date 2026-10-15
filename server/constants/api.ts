/**
 * API-related constants for the Cat API client
 */

/**
 * Time-to-live for cached responses in milliseconds
 * Default: 24 hours (86400000 ms)
 */
export const CACHE_TTL = 1000 * 60 * 60 * 24;

/**
 * Time window for rate limiting in milliseconds
 * Default: 2 seconds (2000 ms)
 */
export const RATE_WINDOW = 1000 * 2;

/**
 * Maximum number of requests allowed per rate window
 * Default: 20 requests per 2 seconds
 */
export const RATE_MAX = 20;

/**
 * Request timeout in milliseconds
 * Default: 10 seconds (10000 ms)
 * Prevents requests from hanging indefinitely on slow/unresponsive APIs
 */
export const REQUEST_TIMEOUT = 10000;

/**
 * Maximum number of retry attempts for transient failures
 * Default: 3 retries
 */
export const MAX_RETRIES = 3;

/**
 * Delay between retry attempts in milliseconds
 * Default: 1 second (1000 ms)
 */
export const RETRY_DELAY = 1000;
