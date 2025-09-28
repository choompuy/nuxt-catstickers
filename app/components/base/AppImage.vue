<script setup lang="ts">
import { ref } from "vue";
import Skeleton from "./Skeleton.vue";

interface Props {
    src: string;
    alt?: string;
    lazy?: boolean;
    width?: number;
    height?: number;
    aspectRatio?: number;
    borderRadius?: string;
    withBorder?: boolean;
    notDraggable?: boolean;
}

defineProps<Props>();

const isLoading = ref(true);

const handleLoad = (e: Event) => {
    isLoading.value = false;
};
</script>

<template>
    <div
        class="app-image-wrapper"
        :class="{
            'app-border': withBorder,
        }"
        :style="{
            width: width ? width + 'px' : '100%',
            height: height ? height + 'px' : 'auto',
            aspectRatio: aspectRatio,
            borderRadius: borderRadius || '0',
        }"
    >
        <Skeleton v-if="isLoading" />
        <NuxtImg
            class="app-image"
            :src="src"
            :alt="alt || ''"
            :loading="lazy ? 'lazy' : 'eager'"
            :draggable="!notDraggable"
            @load="handleLoad"
            :style="{ opacity: isLoading ? 0 : 1 }"
        />
    </div>
</template>

<style scoped lang="scss">
.app-image-wrapper {
    position: relative;
    background-color: $surface-1;
    overflow: hidden;

    .app-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity $transition;
    }
}
</style>
