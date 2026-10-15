<script setup lang="ts">
import AppInput from "~/components/base/AppInput.vue";
import type { CanvasObjectState } from "~/types/canvasObject";
import type { FieldSchema } from "./PropertiesFields";
import AppColorPicker from "~/components/base/AppColorPicker.vue";

const props = defineProps<{
    state: CanvasObjectState;
    field: FieldSchema;
}>();

const emit = defineEmits<{
    (e: "update", value: any): void;
}>();

function isComponent(v: any): boolean {
    return typeof v === "object" || typeof v === "function";
}

function getValue() {
    const raw = props.state[props.field.key as keyof typeof props.state];
    return props.field.format ? props.field.format(raw) : raw;
}

function handle(value: any) {
    let v = value;

    if (props.field.parse) {
        v = props.field.parse(value);
        if (v === null) return;
    }

    emit("update", v);
}
</script>

<template>
    <AppInput
        v-if="field.type === 'number' || field.type === 'text'"
        :id="field.key"
        :type="field.type"
        :value="getValue()"
        :min="field.min"
        :max="field.max"
        :suffix="field.suffix"
        @change="handle"
    >
        <template #left v-if="field.icon">
            <component v-if="isComponent(field.icon)" :is="field.icon" />
            <span v-else>{{ field.icon }}</span>
        </template>
    </AppInput>

    <AppColorPicker
        v-else-if="field.type === 'color'"
        :id="field.key"
        :value="getValue() || '#ffffff'"
        @input="handle"
        @change="handle"
    />
</template>

<style lang="scss" scoped></style>
