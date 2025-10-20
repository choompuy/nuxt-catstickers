<script setup lang="ts">
interface Props {
    variant?: "primary" | "secondary" | "transparent" | "text";
    type?: "button" | "submit" | "reset" | "link";
    size?: "small" | "large";
    href?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "click", event: MouseEvent): void;
}>();

const attributes = computed(() => ({
    class: "app-button flex-row gap-s",
    "data-variant": props.variant || "primary",
    "data-size": props.size,
}));
</script>

<template>
    <div class="app-button-wrapper" :class="{ 'app-shadow': variant === 'primary' }">
        <NuxtLink v-if="type === 'link'" :to="href"  v-bind="attributes">
            <slot />
        </NuxtLink>
        <button v-else :type="type || 'button'" @click="emit('click', $event)" v-bind="attributes">
            <slot />
        </button>
    </div>
</template>

<style lang="scss" scoped>
.app-button-wrapper {
    display: flex;
    border-radius: 0.5rem;
}

.app-button {
    width: auto;
    min-height: $button-height;
    padding: 0.75rem;
    border: $border;
    border-radius: inherit;
    transition: $transition-fancy;
}

.app-button[data-variant="primary"] {
    color: $surface-0;
    background-color: $onSurface-0;
    transition-property: transform, box-shadow;

    &:hover {
        transform: translate3d(-2px, -2px, 0);
    }

    &:active {
        transform: translate3d(0, 0, 0);
    }
}

.app-button[data-variant="secondary"] {
    color: $onSurface-0;
    background-color: $surface-2;
    transition-property: background-color, transform, box-shadow;

    &:hover {
        background-color: $border-color-1;
    }

    &:active {
        transform: scale(0.98);
    }
}

.app-button[data-variant="transparent"] {
    color: $border-color-1;
    background-color: transparent;
    transition-property: color, background-color, transform, box-shadow;

    &:hover {
        color: $onSurface-0;
        background-color: $border-color-1;
    }

    &:active {
        transform: scale(0.98);
    }
}

.app-button[data-variant="text"] {
    padding: 0;
    border: none;
    border-radius: 0;
    background-color: transparent;
    transition-property: opacity, transform;

    &:hover,
    &:active {
        opacity: 0.6;
    }

    &:active {
        transform: scale(0.98);
    }
}

.app-button[data-size="small"] {
    min-height: $button-height-small;
    padding: 0.5rem;
}

.app-button[data-size="large"] {
    min-height: $button-height-large;
    padding: 1rem;
}
</style>
