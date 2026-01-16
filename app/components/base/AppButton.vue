<script setup lang="ts">
import type { AppButtonVariant } from "~/types/appButton";

interface Props {
    variant?: AppButtonVariant;
    type?: "button" | "submit" | "reset" | "link";
    size?: "small" | "large";
    textDecoration?: "none" | "underline";
    href?: string;
    title?: string;
    ariaLabel?: string;
    hint?: string;
    hintPos?: "top" | "bottom" | "left" | "right";
    active?: boolean;
    fill?: boolean;
    iconOnly?: boolean;
    disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "click", event: MouseEvent): void;
}>();

const attributes = computed(() => ({
    class: "app-button flex-row gap-s",
    "data-variant": props.variant || "primary",
    "data-size": props.size,
    "data-icon-only": props.iconOnly,
    "aria-label": props.ariaLabel,
    title: props.title,
    style: { textDecoration: props.textDecoration || "none" },
}));
</script>

<template>
    <div class="app-button-wrapper" :class="{ fill: fill }">
        <NuxtLink v-if="type === 'link'" :to="href" v-bind="attributes">
            <slot />
        </NuxtLink>
        <button v-else :type="type || 'button'" @click="emit('click', $event)" v-bind="attributes" :class="{ active: active }" :disabled="disabled">
            <slot />
        </button>
        <div class="hint text-s" :data-hint-pos="hintPos || 'top'" v-if="hint">{{ hint }}</div>
    </div>
</template>

<style lang="scss" scoped>
.app-button-wrapper {
    position: relative;
    display: flex;
    border-radius: 0.5rem;

    &.fill {
        width: 100%;

        .app-button {
            width: 100%;
            justify-content: center;
        }
    }

    .hint {
        position: absolute;
        place-self: center;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        border: 2px $border-1;
        background-color: $surface-0;
        color: $onSurface-0;
        text-wrap: nowrap;
        opacity: 0;
        transition: opacity $transition-pop;
        transition-delay: 0s;
        pointer-events: none;
        z-index: 10;

        &[data-hint-pos="top"] {
            bottom: 100%;
            left: 0;
            right: 0;
            margin-bottom: 0.25rem;
        }

        &[data-hint-pos="bottom"] {
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 0.25rem;
        }

        &[data-hint-pos="left"] {
            top: 0;
            bottom: 0;
            right: 100%;
            margin-right: 0.25rem;
        }

        &[data-hint-pos="right"] {
            top: 0;
            bottom: 0;
            left: 100%;
            margin-left: 0.25rem;
        }
    }

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            .hint {
                opacity: 1;
                transition-delay: 0.5s;
            }
        }
    }
}

.app-button {
    width: auto;
    height: $button-height;
    padding-inline: 0.5rem;
    border: 2px $border-1;
    border-radius: inherit;
    transition: $transition-fancy;

    &:disabled {
        opacity: 0.6;
        pointer-events: none;
    }
}

.app-button[data-variant="button"] {
    color: $surface-0;
    background-color: $onSurface-0;
    transition-property: opacity, transform, box-shadow;

    &:hover {
        transform: translate3d(-2px, -2px, 0);
    }

    &:active {
        transform: translate3d(0, 0, 0);
    }
}

.app-button[data-variant="primary"] {
    color: $surface-2;
    background-color: $onSurface-0;
    transition-property: opacity, color, background-color, transform;
    border-color: $secondary-text-color;

    &:hover,
    &.active {
        background-color: $border-color-2;
    }

    &:active {
        transform: scale(0.98);
    }
}

.app-button[data-variant="secondary"] {
    color: $onSurface-0;
    background-color: $surface-1;
    transition-property: opacity, background-color, transform;

    &:hover,
    &.active {
        background-color: $border-color-1;
    }

    &:active {
        transform: scale(0.98);
    }
}

.app-button[data-variant="transparent"] {
    color: $border-color-1;
    background-color: transparent;
    transition-property: opacity, color, background-color, transform;

    &:hover,
    &.active {
        color: $onSurface-0;
        background-color: $border-color-1;
    }

    &:active {
        transform: scale(0.98);
    }
}

.app-button[data-variant="text"] {
    border: none;
    background-color: transparent;
    transition-property: background-color, transform;

    &:hover,
    &.active {
        background-color: $border-color-1;
    }

    &:active {
        transform: scale(0.98);
    }
}

.app-button[data-size="small"] {
    height: $button-height-small;
    padding-inline: 0.375rem;
}

.app-button[data-size="large"] {
    height: $button-height-large;
    padding-inline: 0.75rem;
}

.app-button[data-icon-only="true"] {
    justify-content: center;
    align-items: center;
    width: $button-height;
    padding: 0;

    &[data-size="small"] {
        width: $button-height-small;
    }

    &[data-size="large"] {
        width: $button-height-large;
    }
}
</style>
