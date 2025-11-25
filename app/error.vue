<script setup lang="ts">
import type { NuxtError } from "#app";
import Error from "./components/Error.vue";

useHead({
    title: "Error",
});

const props = defineProps({
    error: Object as () => NuxtError,
});
</script>

<template>
    <Error v-if="error" :error="error" />
</template>
