<script setup lang="ts">
import type { Cat } from "~/types/cat";
import AppImage from "./base/AppImage.vue";

interface Props {
    cat: Cat;
}

defineProps<Props>();
</script>

<template>
    <NuxtLink :to="`/cat/${cat.id}`" class="cat-preview">
        <AppImage
            :src="cat.url"
            :image-width="cat.width"
            :image-height="cat.height"
            width="100%"
            height="100%"
            :aspect-ratio="cat.width / cat.height"
            alt="Cat image"
            :lazy="true"
        />
        <div class="cat-actions-wrapper">
            <div class="cat-actions flex-row gap-s text-s text-weight-500">
                <p
                    class="cat-title"
                    :class="{
                        'secondary-text': !cat.breeds[0]?.name,
                    }"
                >
                    {{ cat.breeds[0]?.name || "No breed info" }}
                </p>
                <IconsArrowUpRight />
            </div>
        </div>
    </NuxtLink>
</template>

<style lang="scss" scoped>
.cat-preview {
    position: relative;
    border-radius: 0.75rem;
    transition: $transition-fancy;
    transition-property: transform;
    overflow: hidden;

    &:active {
        transform: scale(0.98);
    }

    &:hover .cat-actions-wrapper,
    &:focus-visible .cat-actions-wrapper {
        opacity: 1;
    }

    .cat-actions-wrapper {
        position: absolute;
        inset: 0;
        display: flex;
        background: $surface-0;
        background: $fade-gradient;
        opacity: 0;
        transition: opacity $transition;

        .cat-actions {
            align-items: flex-end;
            justify-content: space-between;
            width: 100%;
            margin-top: auto;
            padding: 0.75rem;
        }

        .cat-title {
            flex: 1;
            display: -webkit-box;
            word-break: break-all;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
}
</style>
