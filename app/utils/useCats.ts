import { ref } from "vue";
import type { Cat } from "~/types/cat";
import type { CatQuery } from "~/types/catQuery";

export const useCats = () => {
    const cats = ref<Cat[]>([]);
    const loading = ref(false);
    const page = ref(0);
    const hasMore = ref(true);

    let controller: AbortController | null = null;

    const resetCats = () => {
        if (controller) {
            controller.abort("Resetting cat list");
            controller = null;
        }

        cats.value = [];
        page.value = 0;
        hasMore.value = true;
        loading.value = false;
    };

    const loadCats = async (breed_ids?: string) => {
        if (loading.value || !hasMore.value) return;

        if (controller) controller.abort("New request initiated");
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

            if (!data || data.length === 0) {
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
            if (error.name === "AbortError") {
                console.warn("Request aborted");
                return;
            }
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    return { cats, loading, hasMore, loadCats, resetCats };
};
