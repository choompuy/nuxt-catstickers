<script setup lang="ts">
import type { CatQuery } from "~/types/catQuery";
import type { Cat } from "~/types/cat";
import AppButton from "./base/AppButton.vue";
import AppImage from "./base/AppImage.vue";

const imageSize = 64;
const imageBorder = 4;
const imageCount = 3;
const imageSpacing = -12;
const imagesMaxSize = (imageSize + imageSpacing - imageSpacing / imageCount) * imageCount + imageBorder + "px";
const imagesMinSize = imageSize + imageBorder + "px";
const onSticker = ref(false);

const catQuery: CatQuery = {
    limit: imageCount,
    order: "RAND",
};

const { data: cats, error } = useFetch<Cat[]>("/api/cats", {
    query: catQuery,
});

const getSize = (isWidth = true) => {
    if (isWidth) return onSticker.value ? imagesMaxSize : imagesMinSize;
    return onSticker.value ? imagesMinSize : imagesMaxSize;
};

const getTransform = (idx: number) => {
    if (onSticker.value) {
        return `translateX(${idx * (imageSize + imageSpacing)}px)`; // row
    }
    return `translateY(${idx * (imageSize + imageSpacing)}px)`; // column
};

const handleMouseEnter = () => {
    onSticker.value = true;
};

const handleMouseLeave = () => {
    onSticker.value = false;
};
</script>

<template>
    <div class="sticker-wrapper" :class="{ onSticker: onSticker }">
        <div class="sticker gap-s" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <div class="sticker-title">
                <h1 class="exo2-700 text-xl">Random Cats</h1>
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
                        v-for="(cat, idx) in cats"
                        :key="idx"
                        :src="cat.url"
                        class="sticker-image"
                        :image-width="cat.width"
                        :image-height="cat.height"
                        :width="imageSize + 'px'"
                        :height="imageSize + 'px'"
                        alt="Random cat"
                        fit-mode="cover"
                        border-radius="0.75rem"
                        with-border
                        not-draggable
                        :style="{
                            transform: getTransform(idx),
                        }"
                    />
                </div>
                <div v-else>{{ error }}</div>
            </div>

            <div class="actions flex-row">
                <span class="action-show">
                    <IconsArrowLeft />
                </span>
                <AppButton class="action-hide" variant="primary" size="small">
                    <p class="exo2-600 text-s">Get random cats</p>
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
    z-index: 10;

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
