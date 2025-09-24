import type { Cat } from "~/types/cat";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const limit = Number(query.limit) || 3;

    const cats = await $fetch<Cat[]>(`https://cataas.com/api/cats?limit=${limit}`);
    const images = cats.map((cat) => `https://cataas.com/cat/${cat.id}`);

    return { images };
});
