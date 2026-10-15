<script setup lang="ts">
import { KeepAlive } from "vue";
import EditorProperties from "./EditorProperties.vue";
import AppSection from "~/components/base/AppSection.vue";
import AppButton from "~/components/base/AppButton.vue";
import Layers from "~/components/icons/Layers.vue";
import History from "~/components/icons/History.vue";
import Sliders from "~/components/icons/Sliders.vue";

const props = defineProps<{
    canvas: ReturnType<typeof useCanvas>;
}>();

const { core, history, layers } = props.canvas;

const TABS = [
    {
        id: "layers",
        title: "Layers",
        icon: Layers,
        component: defineAsyncComponent(() => import("./panels/Layers.vue")),
        props: {
            layers: layers,
        },
    },
    {
        id: "history",
        title: "History",
        icon: History,
        component: defineAsyncComponent(() => import("./panels/History.vue")),
        props: {
            history: history,
        },
    },
    {
        id: "filters",
        title: "Filters",
        icon: Sliders,
        component: null,
        props: null,
    },
] as const;

const SIDEBAR_WIDTH_KEY = "catstickers-sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 300;
const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 560;

const currentTabId = ref<(typeof TABS)[number]["id"]>("layers");
const currentTab = computed(() => TABS.find((t) => t.id === currentTabId.value) || TABS[0]);
const sidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);

let pointerCleanup: (() => void) | null = null;

function clampWidth(value: number) {
    return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, value));
}

function persistSidebarWidth() {
    props.canvas.core.handleResize();
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth.value));
}

function resetSidebarWidth() {
    sidebarWidth.value = DEFAULT_SIDEBAR_WIDTH;
    persistSidebarWidth();
}

function startResize(event: PointerEvent) {
    const startX = event.clientX;
    const startWidth = sidebarWidth.value;

    const onMove = (moveEvent: PointerEvent) => {
        sidebarWidth.value = clampWidth(startWidth - (moveEvent.clientX - startX));
    };

    const onUp = () => {
        persistSidebarWidth();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        pointerCleanup = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    pointerCleanup = onUp;
}

onMounted(() => {
    const storedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));

    if (!Number.isNaN(storedWidth) && storedWidth > 0) {
        sidebarWidth.value = clampWidth(storedWidth);
    }
});

onBeforeUnmount(() => {
    pointerCleanup?.();
});
</script>

<template>
    <aside class="right-bar border-left" :style="{ width: `${sidebarWidth}px` }">
        <button
            class="resize-handle"
            type="button"
            title="Resize sidebar"
            aria-label="Resize sidebar"
            @pointerdown.prevent="startResize"
            @dblclick="resetSidebarWidth"
        />

        <AppSection :title="currentTab.title">
            <template #header-end>
                <div class="tabs flex-row gap-xs">
                    <AppButton
                        v-for="t in TABS"
                        :key="t.id"
                        class="tab"
                        :active="currentTabId === t.id"
                        :title="t.title"
                        :aria-label="t.title"
                        variant="state"
                        size="small"
                        icon-only
                        @click="currentTabId = t.id"
                    >
                        <component :is="t.icon" />
                    </AppButton>
                </div>
            </template>

            <template #default>
                <div class="tab-content">
                    <KeepAlive v-if="currentTab.component">
                        <component :is="currentTab.component" v-bind="currentTab.props" />
                    </KeepAlive>
                    <div v-else>
                        <p>{{ currentTab.title }}</p>
                    </div>
                </div>
            </template>
        </AppSection>

        <EditorProperties :layers="layers" />
    </aside>
</template>

<style lang="scss" scoped>
.right-bar {
    position: relative;
    display: grid;
    grid-template-rows: 0.3fr 0.7fr;
    min-width: 0;
    background: $surface-0;

    .resize-handle {
        position: absolute;
        top: 0;
        left: -3px;
        z-index: 2;
        width: 6px;
        height: 100%;
        cursor: col-resize;
        background: transparent;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem;
        background: color-mix(in srgb, $surface-0 88%, $surface-1 12%);
    }

    .sidebar-title {
        min-width: 0;

        h3 {
            font-size: 1rem;
            font-weight: 700;
            line-height: 1.1;
        }
    }

    .tabs {
        padding: 0.25rem;
        border: 1px solid $surface-3;
        border-radius: 0.875rem;
        background: $surface-1;
    }

    .tab-content {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .tab {
        flex: 0 0 auto;
    }
}
</style>
