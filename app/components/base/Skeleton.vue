<script setup lang="ts">
interface Props {
    isOverlay?: boolean;
    borderRadius?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <div
        class="skeleton"
        :class="{
            isOverlay: isOverlay,
        }"
        :style="{
            borderRadius: borderRadius || '0',
        }"
    ></div>
</template>

<style lang="scss" scoped>
.skeleton {
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    background-color: $surface-1;
    animation: shimmer 2s infinite;

    &.isOverlay {
        position: absolute;
        inset: 0;
    }
}

@keyframes shimmer {
    0% {
        background-color: $surface-1;
    }
    50% {
        background-color: $surface-2;
    }
    100% {
        background-color: $surface-1;
    }
}
</style>
