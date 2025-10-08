<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";

const props = defineProps<{
    src: string;
    aspectRatio: number;
    visible: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
}>();

const close = () => emit("close");
</script>

<template>
    <div v-if="visible" class="fullscreen-overlay" @click.self="close">
        <div class="fullscreen-container" :style="{ aspectRatio: aspectRatio }">
            <NuxtImg :src="src" alt="Cat full image" class="fullscreen-image" />
        </div>
        <div class="fullscreen-controls">
            <AppButton @click="close" variant="transparent" size="small">
                <IconsClose />
            </AppButton>
        </div>
    </div>
</template>

<style scoped>
.fullscreen-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 9999;
}

.fullscreen-container {
    position: relative;
    display: flex;
    max-width: 100%;
    max-height: 100%;
}

.fullscreen-image {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 100%;
}

.fullscreen-controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
}
</style>
