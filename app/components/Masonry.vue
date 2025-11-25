<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import type { Cat } from "~/types/cat";

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

let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
let listenersAttached = false;

// If reset === true, rebuild empty columns first and distribute all items
const distributeItems = (cats: Cat[], reset = false) => {
    if (!isPageActive.value || !masonryRef.value) return;

    const count = columnsCount.value || getColumnsCount();
    if (reset || !columns.value.length) {
        columns.value = Array.from({ length: count }, () => []);
    } else if (columns.value.length !== count) {
        // if columns count changed, rebuild empty columns
        columns.value = Array.from({ length: count }, () => []);
    }

    const colWidth = masonryRef.value.offsetWidth / columnsCount.value;
    // heights of each column (estimate by aspect ratio)
    const heights = columns.value.map((col) => col.reduce((sum, cat) => sum + ((cat.height ?? 1) / (cat.width ?? 1)) * colWidth, 0));

    cats.forEach((cat) => {
        // find shortest column
        let minIndex = 0;
        let min = heights[0] ?? 0;
        for (let i = 1; i < heights.length; i++) {
            let currentHeight = heights[i] ?? 0;
            if (currentHeight < min) {
                min = currentHeight;
                minIndex = i;
            }
        }

        columns.value[minIndex]?.push(cat);
        heights[minIndex] = (heights[minIndex] ?? 0) + (cat.height / cat.width) * colWidth;
    });
};

const rebuildGrid = async () => {
    if (!isPageActive.value || !masonryRef.value) return;
    columnsCount.value = getColumnsCount();
    distributeItems([...props.items], true);
    await nextTick();
    await fillViewportIfNeeded();
};

const onResize = () => {
    if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(async () => {
        if (!masonryRef.value) return;
        const newCount = getColumnsCount();
        columnsCount.value = newCount;
        distributeItems([...props.items], true);
        await nextTick();
        await fillViewportIfNeeded();
    }, 150);
};

const handleScroll = () => {
    if (scrollTimeout !== null || !masonryRef.value || isLoading.value) return;

    scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        if (!masonryRef.value || isLoading.value) return;

        const container = masonryRef.value.getBoundingClientRect();
        const threshold = window.innerHeight * 1.5;

        if (container.bottom - threshold <= 0) {
            isLoading.value = true;
            emit("loadMore");
        }
    }, 100);
};

const fillViewportIfNeeded = async () => {
    if (!masonryRef.value || !isPageActive.value) return;
    await nextTick();

    const maxAttempts = 6;
    let attempts = 0;

    while (attempts < maxAttempts) {
        if (!masonryRef.value || !isPageActive.value) break;
        await nextTick();

        const container = masonryRef.value.getBoundingClientRect();
        const containerBottom = container.bottom + window.scrollY;
        const viewportBottom = window.scrollY + window.innerHeight * props.loadThreshold;

        // stop if container already fills threshold or currently loading (wait for items)
        if (containerBottom > viewportBottom || isLoading.value) break;

        isLoading.value = true;
        emit("loadMore");

        // wait a bit for parent to fetch/push new items; break if nothing arrives after timeout cycles
        await new Promise((resolve) => setTimeout(resolve, 250));
        attempts++;
    }
};

watch(
    () => props.items.length,
    async (newLength, oldLength) => {
        if (!isPageActive.value) return;

        isLoading.value = false;

        if (newLength === 0) {
            columns.value = Array.from({ length: columnsCount.value || getColumnsCount() }, () => []);
            return;
        }

        if (oldLength === 0 || newLength < oldLength) {
            await rebuildGrid();
            return;
        }

        if (newLength > oldLength) {
            const newCats = props.items.slice(oldLength);
            distributeItems(newCats, false);
            await nextTick();
            await fillViewportIfNeeded();
        }
    },
    { flush: "post" }
);

const attachListeners = () => {
    if (listenersAttached) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    listenersAttached = true;
};

const detachListeners = () => {
    if (!listenersAttached) return;
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", onResize);
    listenersAttached = false;
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
    await nextTick();
    await rebuildGrid();
});

onDeactivated(() => {
    isPageActive.value = false;
    detachListeners();
});

onMounted(async () => {
    attachListeners();
    columnsCount.value = getColumnsCount();
    await nextTick();
    distributeItems([...props.items], true);
    await nextTick();
    await fillViewportIfNeeded();
});

onBeforeUnmount(() => {
    detachListeners();
});
</script>

<template>
    <div ref="masonry" class="masonry flex-row gap-sm">
        <div v-for="(col, colIndex) in columns" :key="'column-' + colIndex" class="masonry-column flex-column gap-sm">
            <slot v-for="cat in col" :key="cat.id" :cat="cat" :column="colIndex" />
        </div>
    </div>
    <div v-if="loading" class="loading text-s text-weight-600">Loading...</div>
</template>

<style scoped lang="scss">
.loading {
    text-align: center;
    margin-inline: auto;
    padding: 1rem;
    color: $onSurface-0;
}

.masonry {
    align-items: flex-start;
}

.masonry-column {
    flex: 1;
}
</style>
