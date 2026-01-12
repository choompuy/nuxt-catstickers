<script setup lang="ts">
import { Transition } from "vue";
import AppModal from "./base/AppModal.vue";
import AppButton from "./base/AppButton.vue";

defineProps<{
    src: string;
    width: number;
    height: number;
    aspectRatio: number;
}>();

const modalVisible = defineModel<boolean>("modalVisible", {
    type: Boolean,
    required: true,
});

const { scale, onWheel, onMouseDown, onMouseMove, onMouseUp, init, reset, close } = useImagePanZoom({
    containerId: "modalContainer",
});
const imageRef = useTemplateRef("image");

const setImageRef = async () => {
    await nextTick();
    if (!imageRef.value) return;
    init(imageRef.value.$el as HTMLImageElement);
};

watch(
    () => modalVisible.value,
    (value) => (value ? setImageRef() : close())
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
                    @wheel.prevent="onWheel"
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
                <AppButton v-if="scale !== 1" @click="reset" variant="transparent" hint="Reset zoom" hint-pos="left" aria-label="Reset zoom" iconOnly>
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
