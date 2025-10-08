<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
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

const distributeItems = (cats: Cat[]) => {
    try {
        cats.forEach((cat) => {
            const heights = getColumnHeights();
            const minIndex = heights.length > 0 ? heights.indexOf(Math.min(...heights)) : 0;
            columns.value[minIndex]?.push(cat);
        });
    } catch (error) {
        console.error(error);
    }
};

const updateColumns = async () => {
    const newCount = getColumnsCount();

    if (newCount !== columnsCount.value) {
        columnsCount.value = newCount;
        const allItems = [...props.items];
        columns.value = Array.from({ length: newCount }, () => []);
        distributeItems(allItems);
    }
};

const handleScroll = () => {
    if (!masonryRef.value) return;

    try {
        const containerHeight = masonryRef.value.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight * props.loadThreshold;

        if (containerHeight < scrollPosition) {
            emit("loadMore");
        }
    } catch (error) {
        console.error(error);
    }
};

const checkInitialLoad = async () => {
    await nextTick();
    if (masonryRef.value && masonryRef.value.offsetHeight < window.innerHeight * props.loadThreshold) {
        emit("loadMore");
    }
};

const rebuildGrid = async () => {
    columns.value = Array.from({ length: columnsCount.value }, () => []);
    distributeItems([...props.items]);
    await checkInitialLoad();
};

watch(
    () => props.items.length,
    async (newLength, oldLength) => {
        if (oldLength <= 0) {
            distributeItems(props.items);
            return;
        }

        if (newLength > oldLength) {
            const newCats = [...props.items].slice(oldLength);
            distributeItems(newCats);
        }
    }
);

const refresh = async () => {
    await rebuildGrid();
};

const getColumnsData = () => {
    return columns.value;
};

onActivated(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateColumns);
});

onDeactivated(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", updateColumns);
});

onMounted(async () => {
    await nextTick();
    await updateColumns();
    await checkInitialLoad();
});

defineExpose({
    refresh,
    getColumnsData,
    updateColumns,
});
</script>

<template>
    <div ref="masonryRef" class="masonry flex-row gap-sm">
        <div v-for="(col, colIndex) in columns" :key="colIndex" class="masonry-column flex-column gap-sm">
            <slot v-for="cat in col" :key="cat.id" :cat="cat" :column="colIndex" />
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
