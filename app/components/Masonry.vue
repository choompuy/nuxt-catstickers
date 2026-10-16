<script setup lang="ts">
import type { Cat } from "#shared/types/cat";
import {
    THROTTLE_WHEEL,
    THROTTLE_SCROLL_MOUSE,
    THROTTLE_SCROLL_TOUCH,
    THROTTLE_RESIZE_MOUSE,
    THROTTLE_RESIZE_TOUCH,
} from "~/constants/performance";
import { computed } from "vue";
import { getColumnsCount } from "~/utils/getColumnsCount";

interface Props {
    items: Cat[];
    loadThreshold?: number;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loadThreshold: 1.5,
});

const emit = defineEmits<{ (e: "loadMore"): void }>();

const masonryRef = useTemplateRef("masonry");
const columns = ref<Cat[][]>([]);
const columnsCount = ref(0);
const isPageActive = ref(true);
const isLoading = ref(false);

// Touch device detection
const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

// Device-specific throttle values
const scrollThrottle = isTouchDevice ? THROTTLE_SCROLL_TOUCH : THROTTLE_SCROLL_MOUSE;
const resizeThrottle = isTouchDevice ? THROTTLE_RESIZE_TOUCH : THROTTLE_RESIZE_MOUSE;

// Memoized distribution of items across columns
const distributedColumns = computed(() => {
    if (!props.items.length || !isPageActive.value) return [];

    const count = getColumnsCount();
    const colCount = count;

    // Initialize empty columns
    const newColumns: Cat[][] = Array.from({ length: colCount }, () => []);

    // Calculate heights for balancing
    const heights = newColumns.map(() => 0);

    // Distribute all items
    props.items.forEach((cat) => {
        const aspectRatio = getCatAspectRatio(cat);

        // Find the shortest column
        let minIndex = 0;
        let minHeight = heights[0] ?? 0;

        for (let i = 1; i < heights.length; i++) {
            const currentHeight = heights[i] ?? 0;
            if (currentHeight < minHeight) {
                minHeight = currentHeight;
                minIndex = i;
            }
        }

        newColumns[minIndex]?.push(cat);
        heights[minIndex] = (heights[minIndex] ?? 0) + aspectRatio;
    });

    return newColumns;
});

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
let resizeRafId: number | null = null;
let listenersAttached = false;
let isFilling = false;

const getCatAspectRatio = (cat: Cat) => (cat.height ?? 1) / (cat.width ?? 1);

const rebuildGrid = async () => {
    if (!isPageActive.value || !masonryRef.value) return;

    columns.value = distributedColumns.value;
    await fillViewportIfNeeded();
};

const onResize = () => {
    if (resizeRafId !== null) return;

    resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;

        if (getColumnsCount() === columnsCount.value) return;

        columns.value = distributedColumns.value;
        void fillViewportIfNeeded();
    });
};

// Debounced resize handler for touch devices
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

const onResizeDebounced = () => {
    if (resizeTimeout !== null) return;

    resizeTimeout = setTimeout(() => {
        resizeTimeout = null;
        onResize();
    }, resizeThrottle);
};

const handleScroll = () => {
    if (scrollTimeout !== null || !masonryRef.value || isLoading.value) return;

    scrollTimeout = setTimeout(() => {
        scrollTimeout = null;

        if (!masonryRef.value || isLoading.value) return;

        const { bottom } = masonryRef.value.getBoundingClientRect();
        const threshold = window.innerHeight * props.loadThreshold;

        if (bottom - threshold <= 0) {
            isLoading.value = true;
            emit("loadMore");
        }
    }, scrollThrottle);
};

const fillViewportIfNeeded = async () => {
    if (!masonryRef.value || !isPageActive.value || isFilling) return;

    isFilling = true;
    try {
        await nextTick();

        const maxAttempts = 6;

        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            if (!masonryRef.value || !isPageActive.value) break;

            await nextTick();

            const { bottom } = masonryRef.value.getBoundingClientRect();
            const viewportBottom = window.scrollY + window.innerHeight * props.loadThreshold;

            // stop if container already fills the threshold or items are being loaded
            if (bottom > viewportBottom || isLoading.value) break;

            isLoading.value = true;
            emit("loadMore");

            // wait a bit for the parent to fetch/push new items
            await new Promise((resolve) => setTimeout(resolve, 250));
        }
    } catch (error) {
        console.error("Error filling viewport:", error);
        // Reset loading state to prevent stuck loading
        isLoading.value = false;
    } finally {
        isFilling = false;
    }
};

watch(
    () => props.items.length,
    async (newLength, oldLength) => {
        if (!isPageActive.value) return;

        isLoading.value = false;

        if (newLength === 0) {
            columnsCount.value = getColumnsCount();
            columns.value = Array.from({ length: columnsCount.value }, () => []);
            return;
        }

        if (oldLength === 0 || newLength < oldLength) {
            await rebuildGrid();
            return;
        }

        if (newLength > oldLength) {
            // Use the computed distributed columns
            columns.value = distributedColumns.value;
            await fillViewportIfNeeded();
        }
    },
    { flush: "post" }
);

const attachListeners = () => {
    if (listenersAttached) return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", isTouchDevice ? onResizeDebounced : onResize, {
        passive: true,
    });
    listenersAttached = true;
};

const detachListeners = () => {
    if (!listenersAttached) return;

    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", isTouchDevice ? onResizeDebounced : onResize);
    listenersAttached = false;

    if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
        resizeRafId = null;
    }

    if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
        resizeTimeout = null;
    }

    if (scrollTimeout !== null) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
    }
};

onActivated(async () => {
    isPageActive.value = true;
    attachListeners();
    isLoading.value = false;

    await rebuildGrid();
});

onDeactivated(() => {
    isPageActive.value = false;
    detachListeners();
});

onMounted(async () => {
    attachListeners();
    columns.value = distributedColumns.value;
    await fillViewportIfNeeded();
});

onBeforeUnmount(() => {
    detachListeners();
});
</script>

<template>
    <div ref="masonry" class="masonry gap-sm">
        <div
            v-for="(col, colIndex) in columns"
            :key="`column-${colIndex}`"
            class="masonry-column flex-column gap-sm"
        >
            <slot
                v-for="(cat, catIndex) in col"
                :key="cat.id"
                :cat="cat"
                :column="colIndex"
                :priority="catIndex === 0"
            />
        </div>
    </div>

    <div v-if="loading" class="loading text-s text-weight-600">Loading...</div>
</template>

<style lang="scss" scoped>
.loading {
    text-align: center;
    margin-inline: auto;
    padding: 1rem;
    color: $text-primary;
}

.masonry {
    // < 600px — подставь свои значения
    --masonry-columns: 2;

    display: grid;
    grid-template-columns: repeat(var(--masonry-columns), minmax(0, 1fr));
    align-items: start;

    @media (min-width: breakpoint("mobile")) {
        --masonry-columns: 3;
    }

    @media (min-width: breakpoint("tablet")) {
        --masonry-columns: 4;
    }

    @media (min-width: breakpoint("desktop")) {
        --masonry-columns: 5;
    }
}

.masonry-column {
    // grid item с min-width: auto может расползти за трек
    min-width: 0;
}
</style>
