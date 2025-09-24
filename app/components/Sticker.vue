<script setup lang="ts">
import ArrowLeft from "./icons/ArrowLeft.vue";

const imageSize = 64;
const imageCount = 3;
const imageSpacing = -12;
const imagesMaxSize = (imageSize + imageSpacing - imageSpacing / imageCount) * imageCount + "px";
const imagesMinSize = imageSize + "px";
const { data, pending, error } = useFetch(`/api/sticker?limit=${imageCount}`);
const images = computed(() => {
    if (pending.value) {
        return Array(imageCount).fill(null);
    }
    return data.value?.images ?? [];
});
const stickerRef = useTemplateRef("sticker");
const onSticker = ref(false);

const getSize = (isWidth = true) => {
    if (isWidth) return onSticker.value ? imagesMaxSize : imagesMinSize;
    return onSticker.value ? imagesMinSize : imagesMaxSize;
};

const getTransform = (idx: number) => {
    if (onSticker.value) {
        return `translateX(${idx * (imageSize + imageSpacing)}px)`; // ряд
    }
    return `translateY(${idx * (imageSize + imageSpacing)}px)`; // колонна
};

const handleMouseEnter = () => {
    onSticker.value = true;
};

const handleMouseLeave = () => {
    onSticker.value = false;
};

onMounted(() => {
    if (stickerRef.value) {
        stickerRef.value.addEventListener("mouseenter", handleMouseEnter);
        stickerRef.value.addEventListener("mouseleave", handleMouseLeave);
    }
});

onUnmounted(() => {
    if (stickerRef.value) {
        stickerRef.value.removeEventListener("mouseenter", handleMouseEnter);
        stickerRef.value.removeEventListener("mouseleave", handleMouseLeave);
    }
});
</script>

<template>
    <div class="sticker-wrapper" :class="{ onSticker: onSticker }">
        <div ref="sticker" class="sticker gap-s">
            <div class="sticker-title">
                <h1 class="exo2-700 text-xl">Консультация эксперта</h1>
            </div>

            <div class="label">
                <div
                    v-if="!error"
                    class="images"
                    :style="{
                        width: getSize(),
                        height: getSize(false),
                    }"
                >
                    <AppImage
                        v-for="(url, idx) in images"
                        :key="idx"
                        :src="url"
                        alt="Random cat"
                        :width="imageSize"
                        :height="imageSize"
                        class="sticker-image"
                        :style="{
                            transform: getTransform(idx),
                        }"
                    />
                </div>
                <div v-else>{{ error }}</div>
            </div>

            <div class="actions flex-row">
                <span class="action-show">
                    <ArrowLeft />
                </span>
                <AppButton class="action-hide" variant="primary" size="small">
                    <p class="exo2-600 text-s">Получить консультацию</p>
                </AppButton>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$after-fancy: 0.1s;

.sticker-wrapper {
    display: flex;
    align-items: center;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;

    .sticker {
        display: grid;
        justify-items: center;
        align-items: center;
        height: 260px;
        padding: 0.25rem;
        border-radius: 1rem 0 0 1rem;
        color: $onSurface-0;
        background-color: $surface-2;
        transition: $transition-fancy;
        transition-property: padding;

        .sticker-title {
            width: min-content;
            max-width: 0;
            max-height: 0;
            text-transform: uppercase;
            text-align: center;
            vertical-align: middle;
            opacity: 0;
            transition: $transition-fancy;
            transition-property: opacity, max-width, max-height;
            overflow: hidden;
        }

        .images {
            position: relative;
            transition: $transition-fancy;
            transition-property: width, height;

            .sticker-image {
                position: absolute;
                top: 0;
                left: 0;
                transition: transform $transition-fancy;
            }
        }

        .actions {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;

            .action-show,
            .action-hide {
                transition: $transition-fancy;
                transition-property: opacity, max-width;
            }

            .action-show {
                position: absolute;
                display: flex;
                z-index: 0;
            }
            .action-hide {
                width: 100%;
                max-width: 0;
                opacity: 0;
                z-index: 1;
            }
        }
    }

    &.onSticker {
        .sticker {
            padding: 1.25rem;
        }

        .sticker-title {
            max-width: 400px;
            max-height: 100px;
            opacity: 1;
        }

        .actions {
            .action-show {
                opacity: 0;
            }
            .action-hide {
                max-width: 400px;
                opacity: 1;
            }
        }

        .sticker-title,
        .action-show,
        .action-hide {
            transition-delay: $after-fancy !important;
        }
    }
}
</style>
