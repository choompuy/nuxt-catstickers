<script setup lang="ts">
import type { InputTypeHTMLAttribute } from "vue";

interface Props {
    id?: string;
    name?: string;
    type?: InputTypeHTMLAttribute;
    value?: any;
    min?: number;
    max?: number;
    maxlength?: number;
    placeholder?: string;
    suffix?: string;
    autocomplete?: "on" | "off";
}

const props = withDefaults(defineProps<Props>(), {
    type: "text",
    autocomplete: "off",
});

const emit = defineEmits<{
    (e: "input", value: string | number): void;
    (e: "change", value: string | number): void;
}>();

const inputRef = useTemplateRef<HTMLInputElement | null>("inputRef");
const internal = ref("");

function format(v: any) {
    if (v == null || v === "") return "";
    return props.suffix ? `${v}${props.suffix}` : String(v);
}

function parseNumber(raw: string): number | null {
    if (!raw) return null;

    const cleaned = raw
        .replace(",", ".")
        .replace(/[^\d.-]/g, " ")
        .trim();

    const match = cleaned.match(/-?(?:\d+|\d*\.\d+)/);
    if (!match) return null;

    const n = Number(match[0]);
    if (!Number.isFinite(n)) return null;

    if (props.min != null && n < props.min) return props.min;
    if (props.max != null && n > props.max) return props.max;

    return n;
}

function onFocus() {
    inputRef.value?.select();
}

function onInput(e: Event) {
    let v = (e.target as HTMLInputElement).value;
    internal.value = v;

    if (props.type === "number") {
        const parsed = parseNumber(v);
        emit("input", parsed ?? v);
    } else {
        emit("input", v);
    }
}

function onChange() {
    let raw = internal.value;

    if (props.type === "number") {
        const parsed = parseNumber(raw);

        if (parsed === null) {
            internal.value = format(props.value);
            inputRef.value?.blur();
            return;
        }

        emit("change", parsed);
        internal.value = format(parsed);
    } else {
        emit("change", raw);
        internal.value = format(raw);
    }

    inputRef.value?.blur();
}

watch(
    () => props.value,
    (v) => {
        internal.value = format(v);
    },
    { immediate: true }
);
</script>

<template>
    <label class="app-input-label flex-row" :for="id">
        <div
            v-if="$slots.left"
            class="app-input__left flex-row text-secondary text-l text-weight-600"
        >
            <slot name="left" />
        </div>

        <input
            ref="inputRef"
            :id="id"
            :name="name"
            class="app-input"
            :type="suffix ? 'text' : type"
            :value="internal"
            :min="min"
            :max="max"
            :maxlength="maxlength"
            :placeholder="placeholder"
            :autocomplete="autocomplete"
            @focus="onFocus"
            @input="onInput"
            @change="onChange"
        />
    </label>
</template>

<style lang="scss" scoped>
.app-input-label {
    width: 100%;
    min-height: $button-height-small;
    height: $button-height-small;
    border: 2px $border-1;
    border-radius: 0.5rem;
    background: $surface-1;
    color: $text-primary;
    overflow: hidden;

    .app-input__left {
        flex-shrink: 0;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        margin-left: 2px;
    }

    .app-input {
        width: 100%;
        height: 100%;
        padding-inline: 0.5rem;
        border: none;
        outline: none;
        background-color: transparent;
        color: inherit;

        &::placeholder {
            color: $text-secondary;
        }
    }
}
</style>
