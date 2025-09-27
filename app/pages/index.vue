<script setup lang="ts">
import { ref } from "vue";
import Masonry from "~/components/Masonry.vue";
import type { Cat } from "~/types/cat";

const cats = ref<Cat[]>([]);
const loading = ref(false);

const loadCats = async () => {
    try {
        const columnsCount = getColumnsCount();
        return await $fetch(`/api/cats?limit=${columnsCount * 6}`);
    } catch (e) {
        console.error("Ошибка загрузки котиков:", e);
        return [];
    }
};

const handleLoadMore = async () => {
    if (loading.value) return;

    loading.value = true;
    try {
        const newCats = await loadCats();
        cats.value.push(...newCats);
    } finally {
        loading.value = false;
    }
};

const initLoad = async () => {
    loading.value = true;
    try {
        const initialCats = await loadCats();
        cats.value = initialCats;
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await initLoad();
});
</script>

<template>
    <main class="flex-column gap-l">
        <h1 class="exo2-900 text-2xl">Home</h1>

        <Sticker />

        <Masonry :items="cats" @load-more="handleLoadMore" />

        <div v-if="loading" class="loading exo2-600 text-s">Loading...</div>
    </main>
</template>

<style scoped lang="scss">
main {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    padding: 1em;
}

.loading {
    text-align: center;
    margin: auto;
    padding: 1rem;
    color: $onSurface-0;
}
</style>
