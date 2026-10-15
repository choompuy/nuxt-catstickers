<script setup lang="ts">
import Header from "~/components/Header.vue";

const route = useRoute();

const { breeds, fetchBreeds } = useBreeds();

watch(
    () => route.path,
    async (path) => {
        if (path !== "/" || breeds.value.length) return;

        await fetchBreeds();
    },
    { immediate: true }
);
</script>

<template>
    <Header />

    <main class="flex-column gap-m">
        <slot />
    </main>
</template>

<style lang="scss" scoped>
main {
    max-width: $page-max-width;
    margin-inline: auto;
    padding: 1em;
    padding-bottom: 2.5rem;
}
</style>
