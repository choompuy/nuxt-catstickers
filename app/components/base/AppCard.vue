<script setup lang="ts">
interface Props {
    title?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <div class="info-card flex-column gap-s">
        <h3 v-if="title" class="card-title text-s">{{ title }}</h3>
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.info-card {
    width: 100%;
    padding: 0.75rem;
    border: $border;
    border-radius: 0.75rem;
    background: $surface-1;
    overflow: hidden;

    .card-title {
        color: $secondary-text-color;
    }
}
</style>
