<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import Logo from "~/components/Logo.vue";
import type { CanvasModes } from "~/types/canvas";

import Grab from "~/components/icons/Grab.vue";
import Lasso from "~/components/icons/Lasso.vue";

const props = defineProps<{ cat: Cat }>();

const wrapperRef = useTemplateRef<HTMLElement>("canvasWrapper");
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");

const { currentMode, initCanvas, switchMode } = useCanvas();

interface Tool {
    id: string;
    mode?: CanvasModes;
    icon: Component;
    action?: () => void;
    hint?: string;
}

const tools = computed<Tool[]>(() => [
    {
        id: "pan",
        mode: "panZoom",
        icon: Grab,
        hint: "Pan",
    },
    {
        id: "lasso",
        mode: "lasso",
        icon: Lasso,
        hint: "Lasso",
    },
]);

onMounted(async () => {
    if (!wrapperRef.value || !canvasRef.value) return;

    initCanvas(wrapperRef.value, canvasRef.value, props.cat.url);
});
</script>

<template>
    <div class="playground">
        <div ref="canvasWrapper" class="canvas-wrapper">
            <canvas ref="canvas" class="canvas" />
        </div>

        <div class="toolbar">
            <div class="toolbar__top flex-row gap-s">
                <div class="panel flex-row gap-s">
                    <Logo variant="text" size="small" icon-only />
                    <IconsChevron />
                    <AppButton type="link" :href="`/cat/${cat.id}`" variant="text" size="small">{{ cat.id }}</AppButton>
                </div>

                <div class="panel flex-row gap-s">
                    <AppButton variant="text" size="small">Undo</AppButton>
                    <AppButton variant="text" size="small">Redo</AppButton>
                    <AppButton variant="text" size="small">Reset</AppButton>
                    <AppButton variant="text" size="small">Save</AppButton>
                </div>
            </div>

            <div class="toolbar__bottom panel flex-row gap-s">
                <AppButton
                    v-for="tool in tools"
                    :key="tool.id"
                    :active="tool.mode && currentMode === tool.mode"
                    :aria-label="tool.hint"
                    :hint="tool.hint"
                    @click="tool.mode ? switchMode(tool.mode) : tool.action?.()"
                    variant="secondary"
                    icon-only
                >
                    <component :is="tool.icon" />
                </AppButton>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playground {
    flex: 1;
    position: relative;
    background: radial-gradient(circle at 1px 1px, $surface-1 1px, transparent 0), $surface-0;
    background-size: 2rem 2rem;

    .canvas-wrapper {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;

        .canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
        }
    }
}

.toolbar {
    &__top {
        position: absolute;
        top: 1rem;
        left: 1rem;
    }

    &__bottom {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
    }
}

.panel {
    width: max-content;
    padding: 0.375rem;
    border-radius: 0.5rem;
    background-color: $surface-1;
    box-shadow: $box-shadow-2;
}
</style>
