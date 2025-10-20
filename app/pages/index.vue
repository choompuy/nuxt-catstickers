<script setup lang="ts">
import { ref } from "vue";
import Masonry from "~/components/Masonry.vue";
import type { Cat } from "~/types/cat";
import type { CatQuery } from "~/types/catQuery";

useHead({
    title: "Home",
    meta: [
        {
            name: "description",
            content: "Cat gallery with Masonry layout",
        },
    ],
});

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

    <Masonry :items="cats" @load-more="handleLoadMore">
        <template #default="{ cat }">
            <CatPreview :cat="cat" />
        </template>
    </Masonry>

    <div v-if="loading || cats.length === 0" class="loading text-s text-weight-600">Loading...</div>
</template>

<style scoped lang="scss">
.loading {
    text-align: center;
    margin-inline: auto;
    padding: 1rem;
    color: $onSurface-0;
}
</style>
