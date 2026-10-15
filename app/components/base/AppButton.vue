<script setup lang="ts">
import type { ButtonHTMLAttributes } from "vue";

interface Props {
    variant?: "primary" | "secondary" | "state" | "outline" | "ghost" | "link" | "danger";
    as?: "button" | "a" | "div" | "span";
    type?: ButtonHTMLAttributes["type"];
    size?: "small" | "medium" | "large" | "auto";
    borderRadius?: "small" | "medium" | "large" | "none";
    href?: string;
    title?: string;
    ariaLabel?: string;
    active?: boolean;
    fullWidth?: boolean;
    iconOnly?: boolean;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: "primary",
    as: "button",
    type: "button",
    size: "medium",
    borderRadius: "medium",
});

const emit = defineEmits<{
    click: [event: MouseEvent | KeyboardEvent];
}>();

const isCustomTag = props.as === "div" || props.as === "span";

const buttonAttrs = computed(() => ({
    class: buttonClass.value,
    "data-variant": props.variant,
    "data-size": props.size,
    "data-border-radius": props.borderRadius,
    "aria-label": props.ariaLabel,
    title: props.title,
    ...(isCustomTag && {
        role: "button",
        tabindex: props.disabled ? -1 : 0,
    }),
}));

const buttonClass = computed(() => [
    "app-button",
    {
        active: props.active,
        "full-width": props.fullWidth,
        "icon-only": props.iconOnly,
    },
]);

function handleKeydown(e: KeyboardEvent) {
    if (props.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        emit("click", e);
    }
}

function handleClick(e: MouseEvent) {
    if (props.disabled) return;
    emit("click", e);
}
</script>

<template>
    <button
        v-if="as === 'button'"
        v-bind="buttonAttrs"
        :type="type"
        :disabled="disabled"
        @click="handleClick"
    >
        <slot />
    </button>

    <NuxtLink
        v-else-if="as === 'a'"
        :to="href"
        v-bind="buttonAttrs"
        :aria-disabled="disabled"
        @click="handleClick"
    >
        <slot />
    </NuxtLink>

    <div
        v-else
        v-bind="buttonAttrs"
        :aria-disabled="disabled"
        @click="handleClick"
        @keydown="handleKeydown"
    >
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.app-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: $button-height;
    padding-inline: 0.5rem;
    gap: 0.5rem;
    border-radius: 0.5rem;
    font: inherit;
    cursor: pointer;
    transition: $transition-fancy;
    transition-property: opacity, background-color, color, border-color;
    text-wrap: nowrap;
    text-decoration: none;

    &[data-size="small"] {
        height: $button-height-small;
        padding-inline: 0.375rem;
    }

    &[data-size="large"] {
        height: $button-height-large;
        padding-inline: 0.75rem;
    }

    &[data-size="auto"] {
        height: auto;
        padding: 0.25rem 0.5rem;
    }

    &[data-border-radius="small"] {
        border-radius: 0.25rem;
    }

    &[data-border-radius="large"] {
        border-radius: 0.75rem;
    }

    &[data-border-radius="none"] {
        border-radius: 0;
    }

    &.icon-only {
        width: $button-height;
        padding: 0;

        &[data-size="small"] {
            width: $button-height-small;
        }

        &[data-size="large"] {
            width: $button-height-large;
        }
    }

    &.full-width {
        width: 100%;
    }

    &[data-variant="primary"] {
        border: 2px solid transparent;
        background-color: $text-primary;
        color: $surface-0;

        &:hover {
            background-color: $text-secondary;
        }

        &:active {
            background-color: $text-muted;
        }
    }

    &[data-variant="secondary"] {
        border: 2px $border-1;
        background-color: $surface-1;
        color: $text-primary;

        &:hover {
            background-color: $surface-2;
        }

        &:active {
            background-color: $surface-3;
        }

        &.active {
            border-color: $text-primary;
            background-color: $surface-3;
        }
    }

    &[data-variant="state"] {
        color: $text-secondary;

        &:hover {
            background-color: $surface-2;
        }

        &:active {
            background-color: $surface-3;
        }

        &.active {
            background-color: $surface-3;
            color: $text-primary;
            background-color: $text-primary;
            color: $surface-0;
        }
    }

    &[data-variant="outline"] {
        border-left: 2px solid transparent;
        background-color: $surface-0;
        color: $text-primary;

        &:hover {
            background-color: $surface-2;
        }

        &:active {
            background-color: $surface-3;
        }

        &.active {
            border-color: $text-primary;
            background-color: $surface-3;
        }
    }

    &[data-variant="ghost"] {
        border: 2px solid $surface-3;
        background-color: transparent;
        color: $surface-3;

        &:hover {
            background-color: $surface-2;
            color: $text-secondary;
        }

        &:active,
        &.active {
            background-color: $surface-3;
            color: $text-primary;
        }
    }

    &[data-variant="link"] {
        color: $text-primary;
        background-color: transparent;

        &:hover {
            background-color: $surface-2;
        }

        &:active {
            background-color: $surface-3;
        }
    }

    &[data-variant="danger"] {
        $danger-active: color-mix(in srgb, $surface-0 100%, $red 35%);
        $danger-hover: color-mix(in srgb, $surface-0 100%, $red 15%);

        border: 2px solid $danger-active;
        color: $red;

        &:hover {
            background-color: $danger-hover;
        }

        &:active {
            background-color: $danger-active;
        }
    }

    &:disabled,
    &[aria-disabled="true"] {
        opacity: 0.6;
        pointer-events: none;
    }
}
</style>
