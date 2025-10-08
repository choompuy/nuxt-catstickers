import type { Cat } from "~/types/cat";
import type { CatQuery } from "~/types/catQuery";

export default defineEventHandler(async (event) => {
    const apiKey = process.env.API_KEY || "";
    const catQuery = getQuery(event) as Partial<CatQuery>;

    const res = await $fetch<Cat[]>(`${process.env.API_URL}/images/search`, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
        },
        query: catQuery
    });

    return res;
});
