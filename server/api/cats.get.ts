import type { Cat } from "~/types/cat";
import type { CatQuery } from "~/types/catQuery";
import { apiRequest } from "~~/server/utils/apiClient";

const apiUrl = process.env.API_URL || "";
const apiKey = process.env.API_KEY || "";

export default defineEventHandler(async (event) => {
    const query = getQuery(event) as Partial<CatQuery>;

    return await apiRequest<Cat[]>(
        `${apiUrl}/images/search`,
        {
            query,
            headers: { "x-api-key": apiKey },
        },
        event
    );
});
