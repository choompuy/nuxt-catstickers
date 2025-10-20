<script setup lang="ts">
import { ref, Transition } from "vue";
import AppButton from "~/components/base/AppButton.vue";

const props = defineProps<{
    src: string;
    aspectRatio: number;
    visible: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
}>();

const isDragging = ref(false);
const scale = ref(1);
const start = ref({ x: 0, y: 0 });
const offset = ref({ x: 0, y: 0 });
const containerRef = useTemplateRef("container");
const imageRef = useTemplateRef("image");
let rafId: number | null = null;

const close = () => {
    emit("close");
    resetZoom();
    document.removeEventListener("keydown", onKeyDown);
    document.body.style.overflow = "";
};

const resetZoom = () => {
    scale.value = 1;
    offset.value = { x: 0, y: 0 };
    smoothUpdate();
};

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

const clampOffset = () => {
    const container = containerRef.value?.getBoundingClientRect();
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
};

const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!containerRef.value || !imageRef.value) return;

    const container = containerRef.value.getBoundingClientRect();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;

    // apply zoom within 1x–10x range
    const newScale = Math.min(Math.max(1, scale.value + delta), 10);

    // calculate mouse position relative to image center
    const mouseX = e.clientX - container.left - container.width / 2 - offset.value.x;
    const mouseY = e.clientY - container.top - container.height / 2 - offset.value.y;

    // adjust offset so zoom centers around cursor position
    offset.value.x -= mouseX * (newScale / scale.value - 1);
    offset.value.y -= mouseY * (newScale / scale.value - 1);

    scale.value = newScale;

    // prevent moving outside container and update transform
    clampOffset();
    smoothUpdate();
};

const onMouseDown = (e: MouseEvent) => {
    if (scale.value <= 1) return;
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
    clampOffset();
    smoothUpdate();
};

const onMouseUp = () => {
    isDragging.value = false;
    const img = imageRef.value?.$el as HTMLElement;
    if (img) img.style.transition = "";
};

const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
};

const show = () => {
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
};

watch(scale, async (value) => {
    if (value <= 1) {
        offset.value = { x: 0, y: 0 };
        smoothUpdate();
    }
});

watch(
    () => props.visible,
    (value) => {
        if (value) {
            show();
        }
    }
);

onDeactivated(() => {
    close();
});

onBeforeUnmount(() => {
    close();
});
</script>

<template>
    <Transition name="fade">
        <div
            v-if="visible"
            class="fullscreen-overlay"
            @wheel="onWheel"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
        >
            <div ref="container" class="fullscreen-container" :style="{ aspectRatio: aspectRatio }">
                <NuxtImg ref="image" class="fullscreen-image" :src="src" alt="Cat full image" densities="x1" draggable="false" placeholder />
            </div>

            <div class="fullscreen-controls flex-column gap-s">
                <AppButton @click="close" variant="transparent" size="small">
                    <IconsClose />
                </AppButton>

                <Transition name="fade">
                    <AppButton v-if="scale !== 1" @click="resetZoom" variant="transparent" size="small">
                        <IconsArrowCircle />
                    </AppButton>
                </Transition>
            </div>
        </div>
    </Transition>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity $transition-fancy;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fullscreen-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: $backdrop-color;
    backdrop-filter: blur(4px);
    z-index: 9999;
}

.fullscreen-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.fullscreen-image {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 100%;
    transition: transform 0.1s ease;
    will-change: transform;
    cursor: grab;
}
.fullscreen-image:active {
    cursor: grabbing;
}

.fullscreen-controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
}
</style>
