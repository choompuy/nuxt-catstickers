<script setup lang="ts">
import { ref } from "vue";
import Masonry from "~/components/Masonry.vue";
import type { Cat } from "~/types/cat";
import type { CatQuery } from "~/types/catQuery";

const cats = ref<Cat[]>([]);
const loading = ref(false);
const page = ref(0);

const loadCats = async (): Promise<Cat[]> => {
    if (loading.value) return [];

    loading.value = true;
    let data: Cat[] = [];
    try {
        const catQuery: CatQuery = {
            limit: getColumnsCount() * 6,
            page: page.value,
            order: "RAND",
        };
        data = await $fetch<Cat[]>("/api/cats", { query: catQuery });
    } catch (e) {
        console.error("Error loading cats:", e);
    } finally {
        page.value++;
        loading.value = false;
    }

    return data;
};

const handleLoadMore = async () => {
    const newCats = await loadCats();
    if (newCats.length !== 0) {
        cats.value.push(...newCats);
    }
};

onMounted(async () => {
    cats.value = await loadCats();
});
</script>

<template>
    <Sticker />

    <main class="flex-column gap-l">
        <h1 class="exo2-900 text-2xl">Home</h1>

        <Masonry :items="cats" @load-more="handleLoadMore">
            <template #default="{ cat }">
                <CatPreview :cat="cat" />
            </template>
        </Masonry>

        <div v-if="loading" class="loading exo2-600 text-s">Loading...</div>
    </main>
</template>

<style scoped lang="scss">
.loading {
    text-align: center;
    margin: auto;
    padding: 1rem;
    color: $onSurface-0;
}
</style>
