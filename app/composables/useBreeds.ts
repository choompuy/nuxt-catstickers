import type { CatBreed } from "#shared/types/cat";

export function useBreeds() {
    const breeds = useState<CatBreed[]>("breeds", () => []);
    const pending = ref(false);
    const error = ref<unknown>(null);

    const fetchBreeds = async () => {
        if (breeds.value.length) return;

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
