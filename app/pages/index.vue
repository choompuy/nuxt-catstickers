<script setup lang="ts">
import CatPreview from "~/components/CatPreview.vue";
import Masonry from "~/components/Masonry.vue";

useHead({
    title: "Home",
    meta: [
        {
            name: "description",
            content: "Cat gallery with Masonry layout",
        },
    ],
});

const route = useRoute();

const breedIds = computed(() => {
    return (route.query.breed as string) || undefined;
});

const { cats, loadCats, resetCats, loading } = useCats();

const handleLoadMore = async () => {
    await loadCats(breedIds.value);
};

watch(
    () => breedIds.value,
    async (value) => {
        resetCats();
        await loadCats(value);
    },
    { immediate: true }
);
</script>

<template>
    <Sticker />

    <Masonry :items="cats" @load-more="handleLoadMore" :loading="loading">
        <template #default="{ cat, priority }">
            <CatPreview :cat="cat" :priority="priority" />
        </template>
    </Masonry>
</template>
