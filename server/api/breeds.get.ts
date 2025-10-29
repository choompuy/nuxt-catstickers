import type { CatBreed } from "~/types/cat";

export default defineEventHandler(async (event) => {
    const apiKey = process.env.API_KEY || "";

    const res = await $fetch<CatBreed[]>(`${process.env.API_URL}/breeds`, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
        },
    });

    return res;
});
