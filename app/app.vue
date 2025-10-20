<script setup lang="ts">
useHead({
    titleTemplate: (titleChunk) => (titleChunk ? `CatStickers | ${titleChunk}` : "CatStickers"),
});
</script>

<template>
    <NuxtLayout>
        <NuxtPage keepalive />
    </NuxtLayout>
</template>
