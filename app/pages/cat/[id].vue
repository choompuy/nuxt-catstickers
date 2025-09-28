<script setup lang="ts">
import AppImage from "~/components/base/AppImage.vue";
import type { Cat } from "~/types/cat";

const route = useRoute();

// useFetch автоматически понимает server/api/*
const { data: cat, pending, error } = await useFetch<Cat>(`/api/cat/${route.params.id}`);
</script>

<template>
    <div>
        <div v-if="pending">Loading...</div>
        <div v-else-if="error">Error: {{ error.message }}</div>
        <div v-else-if="cat">
            <h1>Cat detail</h1>
            <div class="" style="width: 400px">
                <AppImage :src="cat.url || ''" :aspect-ratio="cat.width / cat.height" :alt="cat.breeds?.[0]?.name || 'Cat'" />
            </div>
            <p v-if="cat.breeds?.[0]">{{ cat.breeds[0] }}</p>
            <p v-else>No breed info</p>
        </div>
    </div>
</template>
