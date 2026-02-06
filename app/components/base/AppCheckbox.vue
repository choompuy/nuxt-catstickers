<script setup lang="ts">
interface Props {
    id?: string;
    value?: string;
    label?: string;
}

const props = defineProps<Props>();
const values = defineModel<any>("values");
</script>

<template>
    <label class="app-checkbox-label flex-row gap-s">
        <input v-model="values" :id="id" class="app-checkbox__input" :value="value" type="checkbox" />
        <span class="app-checkbox__box" />
        <p class="text-s">{{ label }}</p>
    </label>
</template>

<style lang="scss" scoped>
.app-checkbox-label {
    flex-shrink: 0;
    cursor: pointer;

    &:focus-within .app-checkbox__box {
        outline: 1px solid $text-primary;
        outline-offset: 2px;
    }
}

.app-checkbox {
    user-select: none;

    &__input {
        appearance: none;
        position: absolute;
        width: $icon-size-small;
        height: $icon-size-small;
        opacity: 0;
        pointer-events: none;
    }

    &__box {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: $icon-size-small;
        height: $icon-size-small;
        border: 1px $border-1;
        border-radius: 0.25rem;
        background-color: transparent;
        transition: $transition-fancy;
        transition-property: border-color, opacity, transform;
        overflow: hidden;
    }

    &__box::after {
        position: absolute;
        content: "";
        inset: 2px;
        border-radius: 0.125rem;
        transform: scale(0);
        transition: $transition-fancy;
        transition-property: background-color, transform;
    }

    &__input:checked + &__box {
        border-color: $text-primary;

        &::after {
            background-color: $text-primary;
            transform: scale(1);
        }
    }

    &__input:active + &__box {
        opacity: 0.6;
    }
}
</style>
