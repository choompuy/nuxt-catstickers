import type { Cat } from "~/types/cat";
import { defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Cat ID is required" });
    }

    const query = getQuery(event);

    const apiKey = process.env.API_KEY || "";

    const res = await $fetch<Cat[]>(process.env.API_URL + `/images/${id}`, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
        },
    });

    return res;
});
