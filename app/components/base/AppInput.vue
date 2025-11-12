<script setup lang="ts">
import type { InputTypeHTMLAttribute } from "vue";

interface Props {
    id?: string;
    type?: InputTypeHTMLAttribute;
    placeholder?: string;
}
const props = defineProps<Props>();
const value = defineModel<any>("modelValue");
</script>

<template>
    <div class="app-input-container">
        <input v-model="value" :id="id" class="app-input" :type="type || 'text'" :placeholder="placeholder" />
    </div>
</template>

<style lang="scss" scoped>
.app-input-container {
    width: 100%;
}

.app-input {
    width: 100%;
    min-height: $button-height-small;
    padding-inline: 0.5rem;
    border: 2px $border-1;
    border-radius: 0.5rem;
    background: $surface-1;
    color: $onSurface-0;

    &::placeholder {
        color: $secondary-text-color;
    }
}
</style>
