<script setup lang="ts">
interface Props {
    variant?: "primary" | "secondary";
    type?: "button" | "submit" | "reset";
    size?: "small" | "large";
}
defineProps<Props>();

const emit = defineEmits<{
    (e: "click", event: MouseEvent): void;
}>();
</script>

<template>
    <div class="app-button-wrapper" :class="{ 'app-shadow': variant === 'primary' }">
        <button class="app-button" :type="type || 'button'" :data-variant="variant || 'primary'" :data-size="size" @click="emit('click', $event)">
            <slot />
        </button>
    </div>
</template>

<style lang="scss" scoped>
.app-button-wrapper {
    display: flex;
    border-radius: 0.75rem;
}

.app-button {
    display: flex;
    align-items: center;
    width: auto;
    height: $button-height;
    padding-inline: 1rem;
    border: none;
    border-radius: inherit;
}

.app-button[data-variant="primary"] {
    color: $surface-0;
    background-color: $onSurface-0;
    border: $border;
    transition: $transition-fancy;
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
}

.app-button[data-size="small"] {
    height: $button-height-small;
    padding-inline: 0.5rem;
}

.app-button[data-size="large"] {
    height: $button-height-large;
    padding-inline: 1.5rem;
}
</style>
