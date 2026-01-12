import { defineEventHandler, getRouterParam } from "h3";
import type { Cat } from "#shared/types/cat";
import { apiRequest } from "~~/server/utils/apiClient";

const apiUrl = process.env.API_URL || "";
const apiKey = process.env.API_KEY || "";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Cat ID is required" });
    }

    return await apiRequest<Cat>(
        `${apiUrl}/images/${id}`,
        {
            headers: { "x-api-key": apiKey },
        },
        event
    );
});
