import type { CatBreed } from "~/types/cat";
import { apiRequest } from "~~/server/utils/apiClient";

const apiUrl = process.env.API_URL || "";
const apiKey = process.env.API_KEY || "";

export default defineEventHandler(async (event) => {
    return await apiRequest<CatBreed[]>(
        `${apiUrl}/breeds`,
        {
            headers: { "x-api-key": apiKey },
        },
        event
    );
});
