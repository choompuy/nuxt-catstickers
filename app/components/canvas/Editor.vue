<script setup lang="ts">
import EditorHeader from "./EditorHeader.vue";
import EditorToolbar from "./EditorToolbar.vue";
import EditorSidebar from "./EditorSidebar.vue";

const props = defineProps<{ cat: Cat }>();

const canvas = markRaw(useCanvas());

const { modifiers } = useHotkeys(
    {
        "ctrl+z": () => canvas.history.undo(),
        "ctrl+shift+z": () => canvas.history.redo(),
        "ctrl+y": () => canvas.history.redo(),
    },
    { preventDefault: true }
);

const wrapperRef = useTemplateRef<HTMLElement>("wrapperElement");
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasElement");

onMounted(() => {
    if (!wrapperRef.value || !canvasRef.value) return;

    canvas.core.initCanvas(wrapperRef.value, canvasRef.value, props.cat.url, modifiers);
});
</script>

<template>
    <div class="container flex-column">
        <EditorHeader :canvas="canvas" />

        <div class="main flex-row">
            <EditorToolbar :core="canvas.core" />

            <div class="content flex-column">
                <div class="content__playground">
                    <div ref="wrapperElement" class="canvas-wrapper">
                        <canvas ref="canvasElement" class="canvas" />
                    </div>
                </div>

                <div class="content__footer flex-row gap-m border-top text-s">
                    <div class="start flex-row gap-s">
                        <div class="flex-row gap-xs">
                            <span class="text-secondary">W:</span>
                            <span>{{ cat.width }}</span>
                        </div>
                        <div class="flex-row gap-xs">
                            <span class="text-secondary">H:</span>
                            <span>{{ cat.height }}</span>
                        </div>
                        <span class="text-secondary">PX</span>
                    </div>

                    <div class="end">
                        <div class="flex-row gap-xs">
                            <span class="text-secondary">ZOOM:</span>
                            <span style="width: 2.25rem; text-align: center"
                                >{{ Math.round(canvas.core.currentZoom.value * 100) }}%</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <EditorSidebar :canvas="canvas" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
}

.main {
    flex: 1;
    overflow: hidden;

    .left-bar,
    .right-bar {
        height: 100%;
        background-color: $surface-0;
    }

    .left-bar {
        padding: 0.5rem 0.25rem;
    }

    .content {
        flex: 1;
        width: 100%;
        height: 100%;

        &__playground {
            flex: 1;
            position: relative;
            height: 100%;
            background:
                radial-gradient(circle at 0.75rem 0.75rem, $surface-3 1px, transparent 0),
                $surface-1;
            background-size: 1.5rem 1.5rem;

            .canvas-wrapper,
            .canvas {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
            }
        }

        &__footer {
            padding: 0.25rem;
            background-color: $surface-0;
        }
    }
}
</style>
