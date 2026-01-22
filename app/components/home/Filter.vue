<script setup lang="ts">
import type { CatBreed } from "#shared/types/cat";
import AppButton from "~/components/base/AppButton.vue";
import AppCheckbox from "~/components/base/AppCheckbox.vue";
import AppInput from "~/components/base/AppInput.vue";
import AppTag from "~/components/base/AppTag.vue";

const route = useRoute();

const containerRef = useTemplateRef("container");
const menuRef = useTemplateRef("menu");
const modalVisible = ref(false);
const search = ref("");
const selectedBreeds = ref<string[]>([]);

const breeds = inject<Ref<CatBreed[]>>("breeds", ref([]));

const filteredBreeds = computed(() => breeds.value.filter((b) => b.name.toLowerCase().includes(search.value.toLowerCase())));

const toggleSelectAll = () => {
    if (selectedBreeds.value.length === breeds.value.length) {
        selectedBreeds.value = [];
    } else {
        selectedBreeds.value = breeds.value.map((b) => b.id);
    }
};

const removeBreed = (id: string) => {
    selectedBreeds.value = selectedBreeds.value.filter((bId) => bId !== id);
};

const applyFilter = () => {
    navigateTo({
        query: {
            ...route.query,
            breed: selectedBreeds.value.join(",") || undefined,
        },
    });
    close();
};

const updateMenuPosition = () => {
    if (!containerRef.value || !menuRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();

    menuRef.value.style.top = `calc(${rect.bottom}px + 0.5rem)`;
    menuRef.value.style.height = `calc(100vh - ${rect.bottom}px - 0.5rem)`;
};

const show = async () => {
    await nextTick();

    updateMenuPosition();

    const breedsParam = (route.query.breed as string) || "";
    if (breedsParam === "") {
        selectedBreeds.value = [];
        return;
    }
    selectedBreeds.value = breedsParam.split(",").filter(Boolean);
};

const close = () => {
    modalVisible.value = false;
};

watch(modalVisible, (value) => (value ? show() : close()));

useBodyScrollLock(modalVisible);
useHotkeys(
    {
        "escape": close,
    },
    { preventDefault: true, condition: modalVisible },
);
useClickOutside(containerRef, close, modalVisible);
</script>

<template>
    <div ref="container" class="filter-container flex-column">
        <AppButton :active="modalVisible" @click="modalVisible = !modalVisible" variant="secondary" :disabled="breeds.length === 0">
            <p>Filter</p>
            <IconsFilter />
        </AppButton>

        <Transition name="slide-down-fade">
            <div v-if="modalVisible" ref="menu" class="filter-menu flex-column">
                <div class="filter-menu__header flex-column gap-s">
                    <AppInput v-model:model-value="search" id="filter-search" type="search" placeholder="Search breed..." />

                    <div class="breeds-control flex-row">
                        <p class="text-s">Breeds ({{ selectedBreeds.length }}/{{ breeds.length }})</p>

                        <AppButton class="text-s" @click="toggleSelectAll" variant="secondary">
                            {{ selectedBreeds.length === breeds.length ? "Deselect All" : "Select All" }}
                        </AppButton>
                    </div>
                </div>

                <ul class="breed-list flex-column gap-sm">
                    <li v-for="breed in filteredBreeds" :key="breed.id" class="flex-row">
                        <AppCheckbox v-model:values="selectedBreeds" :id="breed.id" :value="breed.id" :label="breed.name" />
                    </li>
                </ul>

                <div class="filter-menu__footer flex-column gap-s">
                    <div v-if="selectedBreeds.length" class="selected-breeds flex-row flex-wrap gap-xs">
                        <AppTag
                            v-for="id in selectedBreeds"
                            :key="id"
                            class="text-xs"
                            @click.stop="() => removeBreed(id)"
                            :label="breeds.find((b) => b.id === id)?.name"
                        />
                    </div>

                    <div class="flex-row gap-s">
                        <AppButton @click="selectedBreeds = []" variant="secondary" fill>Reset</AppButton>
                        <AppButton @click="applyFilter" variant="primary" fill>Apply</AppButton>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
.filter-container {
    position: relative;
    justify-content: flex-start;
    align-items: flex-end;
}

.filter-menu {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 100vh;
    background-color: $surface-1;
    border: $border-2;
    overflow-y: auto;
    scrollbar-width: thin;
    z-index: 10;

    &__header,
    &__footer {
        position: sticky;
        padding: 1rem;
        background-color: $surface-2;
        z-index: 1;
    }

    &__header {
        top: 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px $border-1;

        .breeds-control {
            justify-content: space-between;
        }
    }

    &__footer {
        bottom: 0;
        padding-top: 0.5rem;
        border-top: 1px $border-1;
    }
}

.breed-list {
    flex: 1;
    padding: 0.5rem 1rem;
    list-style: none;
}

.selected-breeds {
    max-height: 80px;
    overflow-y: auto;
    scrollbar-width: thin;
}

@media (width >= breakpoint(mobile)) {
    .filter-menu {
        left: auto;
        right: auto;
        bottom: auto;
        width: 400px;
        max-width: calc(100% - 2rem);
        max-height: 600px;
        border-radius: 1rem;
        box-shadow: $box-shadow-2;
    }
}
</style>
