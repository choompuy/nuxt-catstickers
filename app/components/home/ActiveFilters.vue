<script setup lang="ts">
import type { CatBreed } from "#shared/types/cat";
import AppButton from "~/components/base/AppButton.vue";

const route = useRoute();
const router = useRouter();

const breeds = inject<Ref<CatBreed[]>>("breeds", ref([]));

const activeBreedIds = computed<string[]>(() => {
    const q = route.query.breed as string | undefined;
    return q ? q.split(",").filter(Boolean) : [];
});

const activeBreeds = computed(() => {
    if (activeBreedIds.value.length === 0) return [];

    return breeds.value.filter((b) => activeBreedIds.value.includes(b.id));
});

const removeBreed = (id: string) => {
    const updated = activeBreedIds.value.filter((b) => b !== id).join(",");
    router.replace({ query: { ...route.query, breed: updated } });
};

const clearAll = async () => {
    await router.push({ query: {} });
};
</script>

<template>
    <div v-if="activeBreeds.length !== 0" class="flex-row gap-s">
        <div class="active-filter-container flex-row gap-s">
            <AppButton v-for="breed in activeBreeds" :key="breed.id" class="active-filter text-s" @click="removeBreed(breed.id)" variant="secondary" size="auto">
                {{ breed.name }}
            </AppButton>
        </div>
        <AppButton class="text-s text-weight-600" variant="danger" size="auto" @click="clearAll">Clear all</AppButton>
    </div>
</template>

<style lang="scss" scoped>
.active-filter-container {
    overflow-x: auto;

    &::-webkit-scrollbar {
        display: none;
    }

    .active-filter {
        flex-shrink: 0;
    }
}
</style>
