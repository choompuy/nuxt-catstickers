<script setup lang="ts">
interface Props {
    name: string;
    length: number;
    rating: number;
}

const props = defineProps<Props>();
</script>

<template>
    <div class="rating-container flex-row gap-xs">
        <span
            v-for="n in length"
            :key="name + '-rating-' + n"
            class="rating-dot"
            :class="{
                active: n <= rating,
            }"
        />
    </div>
</template>

<style lang="scss" scoped>
.rating-dot {
    width: 0.75rem;
    height: 0.75rem;
    border: 2px $border-1;
    border-radius: 50%;

    &.active {
        border-color: $onSurface-0;
        background-color: $onSurface-0;
    }
}
</style>
