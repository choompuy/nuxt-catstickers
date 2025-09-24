<script setup lang="ts">
import { ref } from "vue";
import Skeleton from "./Skeleton.vue";

interface Props {
    src: string;
    alt?: string;
    lazy?: boolean;
    width?: number | string;
    height?: number | string;
    rounded?: boolean;
}
defineProps<Props>();

const imgRef = useTemplateRef("img");
const isLoading = ref(true);

const handleLoad = () => {
    if (imgRef.value) imgRef.value.style.opacity = "";
    isLoading.value = false;
};
</script>

<template>
    <div
        class="app-image"
        :class="{ rounded: rounded }"
        :style="{
            width: width ? width + 'px' : '100%',
            height: height ? height + 'px' : 'auto',
        }"
    >
        <Skeleton v-if="isLoading" />
        <img ref="img" :src="src" :alt="alt || ''" :loading="lazy ? 'lazy' : 'eager'" @load="handleLoad" draggable="false" style="opacity: 0" />
    </div>
</template>

<style scoped lang="scss">
.app-image {
    position: relative;
    overflow: hidden;

    img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.2s ease;
    }

    &.rounded {
        border-radius: 0.75rem;
    }
}
</style>
