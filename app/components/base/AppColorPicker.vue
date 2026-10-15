<script setup lang="ts">
import AppInput from "./AppInput.vue";

interface Props {
    id?: string;
    value?: string;
}

const props = withDefaults(defineProps<Props>(), {
    value: "",
});

const emit = defineEmits<{
    (e: "input", value: string): void;
    (e: "change", value: string): void;
}>();

const internal = ref("");

function normalizeColor(v: string): string {
    let value = v.trim().toLowerCase();
    if (!value.startsWith("#")) value = "#" + value;

    const match = value.match(/^#([0-9a-f]*)/);
    if (!match || !match[1]) return "#";

    return "#" + match[1].slice(0, 6);
}

function parseColor(v: string): string | null {
    const hex = normalizeColor(v).slice(1);
    return hex.length === 3 || hex.length === 6 ? "#" + hex : null;
}

function toColorInputValue(v: string) {
    return parseColor(v) ?? parseColor(props.value) ?? "#ffffff";
}

function onTextInput(v: any) {
    internal.value = String(v);
}

function onTextChange(v: any) {
    const parsed = parseColor(String(v));

    if (!parsed) {
        internal.value = normalizeColor(props.value);
        return;
    }

    internal.value = parsed;
    emit("change", parsed);
}

function onColorInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;

    internal.value = v;
    emit("input", v);
}

watch(
    () => props.value,
    (v) => {
        internal.value = normalizeColor(v);
    },
    { immediate: true }
);
</script>

<template>
    <AppInput :id="id" type="text" :value="internal" @input="onTextInput" @change="onTextChange">
        <template #left>
            <label class="color-preview">
                <input
                    class="color-input"
                    type="color"
                    :value="toColorInputValue(internal)"
                    @input="onColorInput"
                />
                <span class="color-span" :style="{ background: toColorInputValue(internal) }" />
            </label>
        </template>
    </AppInput>
</template>

<style lang="scss" scoped>
.color-preview {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;

    .color-input {
        position: absolute;
        inset: -4px;
        width: auto;
        height: auto;
        opacity: 0;
        cursor: pointer;
    }

    .color-span {
        display: block;
        width: 100%;
        height: 100%;
    }
}
</style>
