<script setup lang="ts">
import { ref, Transition } from "vue";
import AppModal from "./base/AppModal.vue";
import AppButton from "./base/AppButton.vue";

defineProps<{
    src: string;
    width: number;
    height: number;
    aspectRatio: number;
}>();

const modalVisible = defineModel<boolean>("modalVisible");

const isDragging = ref(false);
const scale = ref(1);
const start = ref({ x: 0, y: 0 });
const offset = ref({ x: 0, y: 0 });
const imageRef = useTemplateRef("image");
let rafId: number | null = null;

const updateTransform = () => {
    const img = imageRef.value?.$el as HTMLElement;
    if (img) {
        img.style.transform = `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value})`;
    }
};

const smoothUpdate = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateTransform);
};

const resetZoom = () => {
    scale.value = 1;
    offset.value = { x: 0, y: 0 };
    smoothUpdate();
};

const clampOffset = () => {
    if (isDragging.value) return;
    const containerRef = document.getElementById("modalContainer");
    if (!containerRef) return;
    const container = containerRef.getBoundingClientRect();
    const imageEl = imageRef.value?.$el as HTMLImageElement;
    if (!container || !imageEl) return;

    const scaledWidth = imageEl.clientWidth * scale.value;
    const scaledHeight = imageEl.clientHeight * scale.value;

    // determine max offset so the image can't move out of bounds
    const maxX = Math.max((scaledWidth - container.width) / 2, 0);
    const maxY = Math.max((scaledHeight - container.height) / 2, 0);

    // clamp offset to keep image fully visible
    offset.value.x = Math.min(Math.max(offset.value.x, -maxX), maxX);
    offset.value.y = Math.min(Math.max(offset.value.y, -maxY), maxY);
    smoothUpdate();
};

const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const containerRef = document.getElementById("modalContainer");
    if (!containerRef || !imageRef.value) return;

    const container = containerRef.getBoundingClientRect();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;

    // apply zoom within 0.5x–10x range
    const newScale = Math.min(Math.max(0.5, scale.value + delta), 10);

    // calculate mouse position relative to image center
    const mouseX = e.clientX - container.left - container.width / 2 - offset.value.x;
    const mouseY = e.clientY - container.top - container.height / 2 - offset.value.y;

    // adjust offset so zoom centers around cursor position
    offset.value.x -= mouseX * (newScale / scale.value - 1);
    offset.value.y -= mouseY * (newScale / scale.value - 1);

    scale.value = newScale;

    // prevent moving outside container and update transform
    clampOffset();
};

const onMouseDown = (e: MouseEvent) => {
    isDragging.value = true;
    const img = imageRef.value?.$el as HTMLElement;
    if (img) img.style.transition = "none";
    start.value = {
        x: e.clientX - offset.value.x,
        y: e.clientY - offset.value.y,
    };
};

const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    offset.value = {
        x: e.clientX - start.value.x,
        y: e.clientY - start.value.y,
    };
    smoothUpdate();
};

const onMouseUp = () => {
    isDragging.value = false;
    const img = imageRef.value?.$el as HTMLElement;
    if (img) img.style.transition = "";
    clampOffset();
};

const handleClose = () => {
    resetZoom();
    window.removeEventListener("wheel", onWheel);
};

onDeactivated(() => {
    handleClose();
});

onBeforeUnmount(() => {
    handleClose();
});

watch(scale, async (value) => {
    if (value <= 1 && !isDragging.value) {
        offset.value = { x: 0, y: 0 };
        smoothUpdate();
    }
});

watch(
    () => modalVisible.value,
    (value) => {
        value ? window.addEventListener("wheel", onWheel, { passive: false }) : handleClose();
    }
);
</script>

<template>
    <AppModal v-model:visible="modalVisible">
        <template #default>
            <div class="fullscreen-image-container" :style="{ aspectRatio: aspectRatio }">
                <NuxtImg
                    @mousedown="onMouseDown"
                    @mousemove="onMouseMove"
                    @mouseup="onMouseUp"
                    @mouseleave="onMouseUp"
                    ref="image"
                    class="fullscreen-image"
                    :src="src"
                    :width="width"
                    :height="height"
                    alt="Cat full image"
                    densities="x1"
                    draggable="false"
                    placeholder
                />
            </div>
        </template>

        <template #controls>
            <Transition name="fade">
                <AppButton v-if="scale !== 1" @click="resetZoom" variant="transparent" size="small">
                    <IconsArrowCircle />
                </AppButton>
            </Transition>
        </template>
    </AppModal>
</template>

<style lang="scss" scoped>
.fullscreen-image-container {
    display: flex;
    margin: auto;
    max-width: 100%;
    max-height: 100%;

    .fullscreen-image {
        width: auto;
        max-width: 100%;
        height: auto;
        max-height: 100%;
        transition: transform 0.1s ease;
        will-change: transform;
        cursor: grab;

        &:active {
            cursor: grabbing;
        }
    }
}
</style>
