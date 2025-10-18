<script setup lang="ts">
import { ref } from "vue";
import Skeleton from "./Skeleton.vue";

interface Props {
    src: string;
    imageWidth: number;
    imageHeight: number;
    width?: string;
    height?: string;
    alt?: string;
    aspectRatio?: number;
    loadingMode?: "lazy" | "eager";
    fitMode?: "cover" | "contain";
    borderRadius?: string;
    withBorder?: boolean;
    notDraggable?: boolean;
}

const props = defineProps<Props>();

const isLoading = ref(true);

const handleLoad = () => {
    isLoading.value = false;
};
</script>

<template>
    <div class="app-image-wrapper" :style="{ aspectRatio: aspectRatio }">
        <Skeleton v-if="isLoading" :style="{ aspectRatio: aspectRatio, borderRadius: borderRadius || '0', margin: 'auto' }" />
        <NuxtImg
            class="app-image"
            :class="{ 'app-border': withBorder }"
            :src="src"
            :width="imageWidth"
            :height="imageHeight"
            :loading="loadingMode || 'eager'"
            :alt="alt || ''"
            densities="x1"
            :draggable="!notDraggable"
            @load="handleLoad"
            placeholder
            :style="{
                width: width || 'auto',
                height: height || 'auto',
                borderRadius: borderRadius || '0',
                opacity: isLoading ? 0 : 1,
                objectFit: fitMode || 'cover',
            }"
        />
    </div>
</template>

<style scoped lang="scss">
.app-image-wrapper {
    position: relative;
    display: flex;
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 100%;
    margin: auto;

    .app-image {
        max-width: 100%;
        max-height: 100%;
        margin: auto;
        box-sizing: content-box;
    }
}
</style>
