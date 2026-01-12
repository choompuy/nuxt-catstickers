import type { Cat } from "#shared/types/cat";
import type { CatQuery } from "#shared/types/catQuery";

export const useCats = () => {
    const cats = ref<Cat[]>([]);
    const loading = ref(false);
    const page = ref(0);
    const hasMore = ref(true);

    let controller: AbortController | null = null;

    const resetCats = () => {
        if (controller) {
            controller.abort("Abort: Resetting cats");
            controller = null;
        }

        cats.value = [];
        page.value = 0;
        hasMore.value = true;
        loading.value = false;
    };

    const loadCats = async (breed_ids?: string) => {
        if (loading.value || !hasMore.value) return;

        if (controller) controller.abort("Abort: New loadCats request");
        controller = new AbortController();

        loading.value = true;

        try {
            const query: CatQuery = {
                limit: 10,
                page: page.value,
                order: breed_ids ? "ASC" : "RAND",
                breed_ids,
            };

            const data = await $fetch<Cat[]>("/api/cats", { query, signal: controller.signal });

            if (!data || !data.length) {
                hasMore.value = false;
                return;
            }

            if (page.value === 0) {
                cats.value = data;
            } else {
                cats.value.push(...data);
            }

            page.value++;
        } catch (error: any) {
            if (error?.status === 429) {
                console.warn("API rate limit hit, try again later");
                hasMore.value = false;
                return;
            }
            console.warn(error);
        } finally {
            loading.value = false;
        }
    };

    return { cats, loading, hasMore, loadCats, resetCats };
};
