<script setup lang="ts">
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
    }
);

onMounted(async () => {
    await loadCats(breedIds.value);
});
</script>

<template>
    <Sticker />

    <Masonry :items="cats" @load-more="handleLoadMore" :loading="loading">
        <template #default="{ cat }">
            <CatPreview :cat="cat" />
        </template>
    </Masonry>
</template>
