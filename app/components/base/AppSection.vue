<script setup lang="ts">
const props = defineProps<{ title?: string }>();
</script>

<template>
    <div class="section flex-column">
        <div v-if="title" class="section-header border-bottom">
            <h3 class="text-secondary text-m text-weight-700 text-uppercase">
                {{ title }}
            </h3>

            <slot name="header-end" />
        </div>

        <div class="section-body">
            <slot />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.section {
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
}

.section-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: $button-height;
    padding: 0.5rem;
}

.section-body {
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
}
</style>
