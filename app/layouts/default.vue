<script setup lang="ts">
import Header from "~/components/Header.vue";
import type { CatBreed } from "#shared/types/cat";

const route = useRoute();

const { breeds, fetchBreeds } = useBreeds();
const providedBreeds = ref<CatBreed[]>([]);
provide("breeds", providedBreeds);

watchEffect(async () => {
    if (route.path === "/" && providedBreeds.value.length === 0) {
        await fetchBreeds();
        providedBreeds.value = breeds.value;
    }
});
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
