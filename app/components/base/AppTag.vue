<script setup lang="ts">
interface Props {
    label?: string;
    variant?: "primary" | "danger";
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "click", event: MouseEvent): void;
}>();
</script>

<template>
    <div class="app-tag-container">
        <button class="app-tag" type="button" @click="emit('click', $event)" :data-variant="variant || 'primary'">
            {{ label }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
.app-tag-container {
    .app-tag {
        padding: 0.25rem 0.5rem;
        border: 2px $border-1;
        border-radius: 0.5rem;
        text-wrap: nowrap;
        transition: $transition-fancy;
        transition-property: background-color, transform;
        cursor: pointer;

        &:active {
            transform: scale(0.98);
        }

        &[data-variant="primary"] {
            background-color: $surface-1;

            &:hover {
                background-color: $border-color-1;
            }
        }

        &[data-variant="danger"] {
            border-color: $red-background;
            color: $red;

            &:hover {
                background-color: $red-background;
            }
        }
    }
}
</style>
