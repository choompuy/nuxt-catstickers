<script setup lang="ts">
import Skeleton from "./Skeleton.vue";

interface Props {
    src: string;
    imageWidth: number;
    imageHeight: number;
    width?: string;
    height?: string;
    preload?: boolean;
    loadingMode?: "lazy" | "eager";
    decoding?: "async" | "sync" | "auto";
    alt?: string;
    aspectRatio?: number;
    fitMode?: "cover" | "contain";
    borderRadius?: string;
    withBorder?: boolean;
    notDraggable?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{ (e: "error", event: string | Event): void }>();

const wrapperRef = useTemplateRef<HTMLElement>("wrapper");
const isLoading = ref(true);

const handleLoad = () => {
    isLoading.value = false;
};

const handleError = (event: string | Event) => {
    isLoading.value = false;
    emit("error", event);
};

// Cached images may finish loading before hydration attaches the @load
// listener — the skeleton would then stick forever. Check the DOM state instead.
onMounted(() => {
    const img = wrapperRef.value?.querySelector("img");
    if (img?.complete) {
        isLoading.value = false;
    }
});
</script>

<template>
    <div ref="wrapper" class="app-image-wrapper" :style="{ aspectRatio: aspectRatio }">
        <Skeleton
            v-if="isLoading"
            :border-radius="borderRadius"
            is-overlay
            :style="{ aspectRatio: aspectRatio, margin: 'auto' }"
        />
        <NuxtImg
            class="app-image"
            :class="{ 'app-border': withBorder }"
            :src="src"
            :width="imageWidth"
            :height="imageHeight"
            :loading="loadingMode || 'eager'"
            :decoding="decoding || 'auto'"
            :preload="preload"
            :alt="alt || ''"
            :draggable="!notDraggable"
            @load="handleLoad"
            @error="handleError"
            :style="{
                width: width || (aspectRatio ? '100%' : 'auto'),
                height: height || (aspectRatio ? '100%' : 'auto'),
                borderRadius: borderRadius || '0',
                opacity: isLoading ? 0 : 1,
                objectFit: fitMode || 'cover',
            }"
        />
    </div>
</template>

<style lang="scss" scoped>
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
