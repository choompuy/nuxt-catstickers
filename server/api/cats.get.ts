import type { Cat } from "~/types/cat";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const limit = Number(query.limit) || 10;

    const apiKey = process.env.API_KEY || "";

    const res = await $fetch<Cat[]>(process.env.API_URL + "/images/search", {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
        },
        query: {
            limit,
            order: "RAND",
        },
    });

    return res;
});