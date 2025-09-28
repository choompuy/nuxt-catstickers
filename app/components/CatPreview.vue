<script setup lang="ts">
import type { Cat } from "~/types/cat";
import AppImage from "./base/AppImage.vue";
import ArrowUpRight from "./icons/ArrowUpRight.vue";

interface Props {
    cat: Cat;
}

const props = defineProps<Props>();

const isHover = ref(false);
const isHaveBreeds = computed(() => !!props.cat.breeds[0]?.name);

const handleEnter = () => {
    isHover.value = true;
};

const handleLeave = () => {
    isHover.value = false;
};
</script>

<template>
    <NuxtLink :to="`/cat/${cat.id}`" class="cat-preview" ref="catPreview" @mouseenter="handleEnter" @mouseleave="handleLeave">
        <AppImage :src="cat.url || ''" :aspect-ratio="cat.width / cat.height" :alt="'Random cat'" :lazy="true" />
        <div class="cat-actions-wrapper" :class="{ active: isHover }">
            <div class="cat-actions flex-row gap-s exo2-500 text-s">
                <p
                    class="cat-title"
                    :class="{
                        'secondary-text': !cat.breeds[0]?.name,
                    }"
                >
                    {{ cat.breeds[0]?.name || "No breed info" }}
                </p>
                <ArrowUpRight />
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

    .cat-actions-wrapper {
        position: absolute;
        inset: 0;
        display: flex;
        background: $surface-0;
        background: $fade-gradient;
        opacity: 0;
        transition: opacity $transition;

        &.active {
            opacity: 1;
        }

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
            -webkit-line-clamp: 2; /* number of lines to show */
            line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
}
</style>
