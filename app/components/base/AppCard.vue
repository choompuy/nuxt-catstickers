<script setup lang="ts">
interface Props {
    title?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <div class="info-card flex-column gap-s">
        <h3 v-if="title" class="card-title text-s text-weight-700">{{ title }}</h3>
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.info-card {
    width: 100%;
    padding: 0.75rem;
    border: 2px $border-1;
    border-radius: 0.75rem;
    background: $surface-1;
    overflow: hidden;

    .card-title {
        color: $text-secondary;
    }
}
</style>
