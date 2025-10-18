<script setup lang="ts">
useHead({
    htmlAttrs: {
        lang: "en",
    },
    titleTemplate: (titleChunk) => (titleChunk ? `CatStickers | ${titleChunk}` : "CatStickers"),
    meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        {
            name: "description",
            content: "Modern cat gallery with Masonry layout",
        },
    ],
});
</script>

<template>
    <NuxtPage keepalive />
</template>
