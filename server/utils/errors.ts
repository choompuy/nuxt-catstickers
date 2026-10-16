/**
 * Custom API Error class for handling API-related errors
 * Provides better error type checking and handling for API requests
 */
export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly isApiError: boolean = true;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Helper method to check if an error is an ApiError
     */
    static isApiError(error: unknown): error is ApiError {
        return error instanceof ApiError;
    }
}
