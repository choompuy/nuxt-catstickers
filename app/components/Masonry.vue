<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import type { Cat } from "~/types/cat";

interface Props {
    items: Cat[];
    loadThreshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
    loadThreshold: 1.5,
});

const emit = defineEmits<{
    loadMore: [];
}>();

const masonryRef = ref<HTMLElement | null>(null);
const columns = ref<Cat[][]>([]);
const columnsCount = ref(0);

const getColumnHeights = (): number[] => {
    if (!masonryRef.value || columnsCount.value === 0) return [];

    const colWidth = masonryRef.value.offsetWidth / columnsCount.value;

    return columns.value.map((col) =>
        col.reduce((sum, cat) => {
            return sum + (cat.height / cat.width) * colWidth;
        }, 0)
    );
};

const distributeItems = (newCats: Cat[]) => {
    newCats.forEach((cat) => {
        const heights = getColumnHeights();
        const minIndex = heights.length > 0 ? heights.indexOf(Math.min(...heights)) : 0;
        if (columns.value[minIndex]) {
            columns.value[minIndex].push(cat);
        }
    });
};

const updateColumns = async () => {
    const newCount = getColumnsCount();

    if (newCount !== columnsCount.value) {
        columnsCount.value = newCount;
        const allItems = columns.value.flat();
        columns.value = Array.from({ length: newCount }, () => []);
        distributeItems(allItems);
    }
};

const handleScroll = () => {
    if (!masonryRef.value) return;

    const containerHeight = masonryRef.value.offsetHeight;
    const scrollPosition = window.scrollY + window.innerHeight * props.loadThreshold;

    if (containerHeight < scrollPosition) {
        emit("loadMore");
    }
};

const checkInitialLoad = async () => {
    await nextTick();
    if (masonryRef.value) {
        while (masonryRef.value.offsetHeight < window.innerHeight * props.loadThreshold) {
            emit("loadMore");
            await nextTick();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
};

const rebuildGrid = async () => {
    await updateColumns();
    distributeItems(props.items);
    await checkInitialLoad();
};

watch(
    () => props.items,
    async (newItems, oldItems) => {
        if (newItems.length === 0) {
            columns.value = Array.from({ length: columnsCount.value }, () => []);
            return;
        }

        if (newItems.length > (oldItems?.length || 0)) {
            // if new el added
            const newItemsToAdd = newItems.slice(oldItems?.length || 0);
            distributeItems(newItemsToAdd);
        } else {
            await rebuildGrid();
        }
    },
    { deep: true }
);

const refresh = async () => {
    await rebuildGrid();
};

const getColumnsData = () => {
    return columns.value;
};

onMounted(async () => {
    await updateColumns();
    await checkInitialLoad();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateColumns);
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", updateColumns);
});

defineExpose({
    refresh,
    getColumnsData,
    updateColumns,
});
</script>

<template>
    <div ref="masonryRef" class="masonry flex-row gap-m">
        <div v-for="(col, colIndex) in columns" :key="colIndex" class="masonry-column flex-column gap-m">
            <div v-for="cat in col" :key="cat.id">
                <AppImage :src="cat.url || ''" :aspect-ratio="cat.width / cat.height" :alt="'Random cat'" :lazy="true" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.masonry {
    align-items: flex-start;
}

.masonry-column {
    flex: 1;
}
</style>
