import type { Cat } from "~/types/cat";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const apiKey = process.env.API_KEY || "";

    const res = await $fetch<Cat[]>(process.env.API_URL + "/images/search", {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
        },
    });

    return res;
});
