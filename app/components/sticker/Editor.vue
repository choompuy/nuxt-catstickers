<script setup lang="ts">
import type { CanvasHistoryMetadata, CanvasModes } from "~/types/canvas";
import AppButton from "~/components/base/AppButton.vue";
import Logo from "~/components/Logo.vue";
import Grab from "~/components/icons/Grab.vue";
import Lasso from "~/components/icons/Lasso.vue";
import Layers from "~/components/icons/Layers.vue";
import History from "~/components/icons/History.vue";
import Sliders from "~/components/icons/Sliders.vue";

interface Tool {
    id: string;
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
    type: string;
    metadata?: CanvasHistoryMetadata;
    index: number;
    isActive: boolean;
    isRedo: boolean;
}

const TOOLS: Tool[] = [
    {
        id: "pan",
        mode: "panZoom",
        icon: Grab,
        title: "Pan",
    },
    {
        id: "lasso",
        mode: "lasso",
        icon: Lasso,
        title: "Lasso",
    },
];

const TABS: Tab[] = [
    {
        id: "layers",
        title: "Layers",
        icon: Layers,
    },
    {
        id: "history",
        title: "History",
        icon: History,
    },
    {
        id: "filters",
        title: "Filters",
        icon: Sliders,
    },
];

const props = defineProps<{ cat: Cat }>();

const { currentMode, currentZoom, history, initCanvas, switchMode, undo, redo, goTo } = useCanvas();

const wrapperRef = useTemplateRef<HTMLElement>("canvasWrapper");
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");
const currentTab = ref<number>(0);

const historyList = computed<HistoryListItem[]>(() => {
    const entries = history.entries.value;
    const currentIndex = history.index.value;
    const len = entries.length;

    const items: HistoryListItem[] = [];

    for (let i = len - 1; i >= 0; i--) {
        let entry = entries[i];
        if (!entry) continue;

        items.push({
            type: entry.type,
            metadata: entry.metadata,
            index: i,
            isActive: i === currentIndex,
            isRedo: i > currentIndex,
        });
    }

    return items;
});

onMounted(async () => {
    if (!wrapperRef.value || !canvasRef.value) return;

    initCanvas(wrapperRef.value, canvasRef.value, props.cat.url);
});

useHotkeys(
    {
        "ctrl+z": undo,
        "ctrl+shift+z": redo,
        "ctrl+y": redo,
    },
    {
        preventDefault: true,
    },
);
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
                    :key="tool.id"
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
                    <span v-if="currentTab === 1" class="end text-s text-weight-600">{{ historyList.length }} actions</span>
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
                                <AppButton
                                    :active="h.isActive"
                                    variant="outline"
                                    size="auto"
                                    border-radius="none"
                                    full-width
                                    @click="() => goTo(h.index)"
                                >
                                    <div class="start flex-column gap-xs">
                                        <span class="text-s">
                                            {{ h.metadata?.label || "No description" }}
                                        </span>
                                        <span class="text-secondary text-xs">
                                            {{ h.type }}
                                        </span>
                                    </div>

                                    <div class="end">
                                        <span class="text-secondary text-xs">
                                            {{ new Date(h.metadata?.timestamp || Date.now()).toLocaleTimeString() }}
                                        </span>
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
                        align-items: flex-start;
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
