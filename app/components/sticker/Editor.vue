<script setup lang="ts">
import type { CanvasHistoryMetadata, CanvasModes } from "~/types/canvas";
import AppButton from "~/components/base/AppButton.vue";
import Logo from "~/components/Logo.vue";

import Move from "~/components/icons/Move.vue";
import Grab from "~/components/icons/Grab.vue";
import Lasso from "~/components/icons/Lasso.vue";
import Rect from "~/components/icons/Rect.vue";
import Ellipse from "~/components/icons/Ellipse.vue";
import Text from "~/components/icons/Text.vue";

import Layers from "~/components/icons/Layers.vue";
import History from "~/components/icons/History.vue";
import Sliders from "~/components/icons/Sliders.vue";

interface Tool {
    mode: CanvasModes;
    icon: Component;
    title: string;
}

interface Tab {
    id: string;
    icon: Component;
    title: string;
}

interface HistoryListItem {
    metadata?: CanvasHistoryMetadata;
    index: number;
    isActive: boolean;
    isRedo: boolean;
}

const TOOLS: Tool[] = [
    { mode: "move", icon: Move, title: "Move" },
    { mode: "panZoom", icon: Grab, title: "Pan" },
    { mode: "lasso", icon: Lasso, title: "Lasso crop" },
    { mode: "rect", icon: Rect, title: "Rect crop" },
    { mode: "ellipse", icon: Ellipse, title: "Ellipse crop" },
    { mode: "text", icon: Text, title: "Add text" },
];

const TABS: Tab[] = [
    { id: "layers", title: "Layers", icon: Layers },
    { id: "history", title: "History", icon: History },
    { id: "filters", title: "Filters", icon: Sliders },
];

const props = defineProps<{ cat: Cat }>();

const { currentMode, currentZoom, history, initCanvas, switchMode, undo, redo, goTo } = useCanvas();

const { modifiers } = useHotkeys(
    {
        "ctrl+z": undo,
        "ctrl+shift+z": redo,
        "ctrl+y": redo,
    },
    { preventDefault: true },
);

const wrapperRef = useTemplateRef<HTMLElement>("canvasWrapper");
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");
const currentTab = ref<number>(1);

const historyList = computed<HistoryListItem[]>(() => {
    const entries = history.entries.value;
    const currentIndex = history.index.value;
    const len = entries.length;

    const items: HistoryListItem[] = [];

    for (let i = len - 1; i >= 0; i--) {
        let entry = entries[i];
        if (!entry) continue;

        items.push({
            metadata: entry.metadata,
            index: i,
            isActive: i === currentIndex,
            isRedo: i > currentIndex,
        });
    }

    return items;
});

function formatTime(timestamp: number) {
    const date = new Date(timestamp);
    const formattedHours = date.getHours().toString().padStart(2, "0");
    const formattedMinutes = date.getMinutes().toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
}

onMounted(async () => {
    if (!wrapperRef.value || !canvasRef.value) return;

    initCanvas(wrapperRef.value, canvasRef.value, props.cat.url, modifiers);
});
</script>

<template>
    <div class="container flex-column">
        <div class="header flex-row gap-m">
            <div class="start flex-row gap-m">
                <Logo size="small" />
                <!-- <IconsChevron />
                        <AppButton type="link" :href="`/cat/${cat.id}`" variant="state" size="small">{{ cat.id }}</AppButton> -->

                <div class="topbar flex-row gap-s">
                    <AppButton variant="state" size="small" class="text-secondary">Reset</AppButton>
                </div>
            </div>

            <div class="end flex-row gap-m">
                <div class="flex-row gap-s">
                    <AppButton variant="state" size="small" icon-only title="Undo" aria-label="Undo" @click="undo" :disabled="!history.canUndo">
                        <IconsUndo />
                    </AppButton>

                    <AppButton variant="state" size="small" icon-only title="Redo" aria-label="Redo" @click="redo" :disabled="!history.canRedo">
                        <IconsRedo />
                    </AppButton>
                </div>
                <AppButton variant="primary" size="small">Export</AppButton>
            </div>
        </div>

        <div class="main flex-row">
            <div class="left-bar flex-column gap-xs">
                <AppButton
                    v-for="tool in TOOLS"
                    :key="tool.mode"
                    variant="state"
                    :active="tool.mode && currentMode === tool.mode"
                    :title="tool.title"
                    :aria-label="tool.title"
                    @click="switchMode(tool.mode)"
                    icon-only
                >
                    <component :is="tool.icon" />
                </AppButton>
            </div>

            <div class="content flex-column">
                <div class="content__playground">
                    <div ref="canvasWrapper" class="canvas-wrapper">
                        <canvas ref="canvas" class="canvas" />
                    </div>
                </div>

                <div class="content__footer flex-row gap-m text-s">
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
                            <span style="width: 2.25rem; text-align: center">{{ Math.round(currentZoom * 100) }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="right-bar">
                <div class="tab-header border-bottom flex-row text-secondary">
                    <h3 class="text-m text-weight-700 text-uppercase">{{ TABS[currentTab]?.title || "" }}</h3>
                </div>

                <div class="tab-content border-bottom">
                    <div v-if="currentTab === 0" class="layers flex-column gap-xs">
                        <div v-for="n in 5" :key="n" style="height: 300px; background-color: #3a3a3a" />
                    </div>

                    <div v-if="currentTab === 1" class="history-wrapper">
                        <TransitionGroup name="list" tag="ul" class="history">
                            <li
                                v-for="h in historyList"
                                :key="h.index"
                                class="history-item border-bottom"
                                :class="{
                                    active: h.isActive,
                                    redo: h.isRedo,
                                }"
                            >
                                <AppButton :active="h.isActive" variant="outline" border-radius="none" full-width @click="() => goTo(h.index)">
                                    <div class="start flex-row gap-s">
                                        <span v-if="h.metadata?.timestamp" class="text-secondary text-xs">
                                            {{ formatTime(h.metadata.timestamp) }}
                                        </span>
                                        <span class="text-s text-overflow">
                                            {{ h.metadata?.label || "No description" }}
                                        </span>
                                    </div>

                                    <div class="end flex-row">
                                        <component v-if="h.metadata?.mode" :is="TOOLS.find((v) => v.mode === h.metadata?.mode)?.icon" />
                                        <!-- <span class="text-secondary text-xs">
                                            {{}}
                                        </span> -->
                                        <span></span>
                                    </div>
                                </AppButton>
                            </li>
                        </TransitionGroup>
                    </div>
                </div>

                <div class="tabs flex-row">
                    <AppButton
                        v-for="(t, i) in TABS"
                        :key="t.id"
                        class="tab"
                        :active="currentTab === i"
                        :title="t.title"
                        :aria-label="t.title"
                        variant="state"
                        border-radius="none"
                        full-width
                        icon-only
                        @click="() => (currentTab = i)"
                    >
                        <component :is="t.icon" />
                    </AppButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
}

.header {
    width: 100%;
    padding: 0.5rem;
    border-bottom: 1px $border-1;
    background-color: $surface-0;
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
        border-right: 1px $border-1;
        padding: 0.5rem 0.25rem;
    }

    .right-bar {
        display: grid;
        grid-template-rows: auto 1fr auto;
        width: 320px;
        border-left: 1px $border-1;

        .border-bottom {
            border-bottom: 1px $border-1;
        }

        .tab-header {
            display: flex;
            align-items: center;
            height: $button-height;
            padding: 0.5rem;
        }

        .tab-content {
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;

            .history {
                position: relative;
                list-style: none;

                .history-item {
                    width: 100%;

                    &.redo {
                        opacity: 0.4;
                    }

                    &.active {
                        opacity: 1;
                    }

                    .start {
                        flex: 1;
                        overflow: hidden;
                    }
                }
            }
        }

        .tab {
            &:not(:last-child) {
                border-right: 1px $border-1;
            }
        }
    }

    .content {
        flex: 1;
        width: 100%;
        height: 100%;

        &__playground {
            flex: 1;
            position: relative;
            height: 100%;
            background: radial-gradient(circle at 0.75rem 0.75rem, $surface-3 1px, transparent 0), $surface-1;
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
            border-top: 1px $border-1;
            background-color: $surface-0;
        }
    }
}
</style>
