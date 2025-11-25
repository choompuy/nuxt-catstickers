import type { CatBreed } from "~/types/cat";

export function useBreeds() {
    const breeds = ref<CatBreed[]>([]);
    const pending = ref(false);
    const error = ref<unknown>(null);

    const fetchBreeds = async () => {
        pending.value = true;
        try {
            const data = await $fetch<CatBreed[]>("/api/breeds");
            breeds.value = data || [];
        } catch (e) {
            error.value = e;
        } finally {
            pending.value = false;
        }
    };

    return { breeds, pending, error, fetchBreeds };
}
