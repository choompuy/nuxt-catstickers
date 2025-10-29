<script setup lang="ts">
interface Props {
    label?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: "click", event: MouseEvent): void;
}>();
</script>

<template>
    <div class="app-tag-container">
        <button class="app-tag" type="button" @click="emit('click', $event)">
            {{ label }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
.app-tag-container {
    .app-tag {
        padding: 0.25rem 0.5rem;
        border: 1px $border-1;
        border-radius: 0.5rem;
        background-color: $surface-1;
        transition: $transition-fancy;
        transition-property: background-color, transform;
        cursor: pointer;

        &:hover {
            background-color: $border-color-1;
        }

        &:active {
            transform: scale(0.98);
        }
    }
}
</style>
