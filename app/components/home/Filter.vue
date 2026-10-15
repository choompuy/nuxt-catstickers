<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import AppCheckbox from "~/components/base/AppCheckbox.vue";
import AppInput from "~/components/base/AppInput.vue";

const route = useRoute();

const { breeds, fetchBreeds } = useBreeds();
await callOnce(fetchBreeds);

const containerRef = useTemplateRef("container");
const menuRef = useTemplateRef("menu");
const modalVisible = ref(false);
const search = ref("");

const selectedBreeds = ref<string[]>([]);
const selectedSet = computed(() => new Set(selectedBreeds.value));

const filteredBreeds = computed(() =>
    breeds.value.filter((b) => b.name.toLowerCase().includes(search.value.toLowerCase()))
);
const filteredIds = computed(() => filteredBreeds.value.map((b) => b.id));
const filteredSet = computed(() => new Set(filteredIds.value));

const allFilteredSelected = computed(
    () => filteredIds.value.length > 0 && filteredIds.value.every((id) => selectedSet.value.has(id))
);

const toggleSelectAll = () => {
    if (allFilteredSelected.value) {
        selectedBreeds.value = selectedBreeds.value.filter((id) => !filteredSet.value.has(id));
    } else {
        const next = new Set(selectedBreeds.value);

        for (const id of filteredIds.value) next.add(id);

        selectedBreeds.value = [...next];
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
        escape: close,
    },
    { preventDefault: true, condition: modalVisible }
);
useClickOutside(containerRef, close, modalVisible);
</script>

<template>
    <div ref="container" class="filter-container flex-column">
        <AppButton
            :active="modalVisible"
            @click="modalVisible = !modalVisible"
            variant="secondary"
            :disabled="breeds.length === 0"
        >
            <p>Filter</p>
            <IconsFilter />
        </AppButton>

        <Transition name="slide-down-fade">
            <div v-if="modalVisible" ref="menu" class="filter-menu flex-column">
                <div class="filter-menu__header flex-column gap-s border-bottom">
                    <AppInput
                        id="filter-search"
                        type="search"
                        :value="search"
                        placeholder="Search breed..."
                        @input="(v) => (search = v)"
                    />

                    <div class="breeds-control flex-row">
                        <p class="text-s">
                            Breeds ({{ selectedBreeds.length }}/{{ filteredBreeds.length }})
                        </p>

                        <AppButton
                            class="text-s"
                            @click="toggleSelectAll"
                            variant="secondary"
                            :disabled="filteredBreeds.length === 0"
                        >
                            {{ allFilteredSelected ? "Deselect All" : "Select All" }}
                        </AppButton>
                    </div>
                </div>

                <div class="filter-menu__main">
                    <ul class="breed-list flex-column gap-sm">
                        <li v-for="breed in filteredBreeds" :key="breed.id" class="flex-row">
                            <AppCheckbox
                                v-model:values="selectedBreeds"
                                :id="breed.id"
                                :value="breed.id"
                                :label="breed.name"
                            />
                        </li>
                    </ul>
                </div>

                <div class="filter-menu__footer flex-column gap-s border-top">
                    <div
                        v-if="selectedBreeds.length"
                        class="selected-breeds flex-row flex-wrap gap-xs"
                    >
                        <AppButton
                            v-for="id in selectedBreeds"
                            :key="id"
                            class="text-xs"
                            @click.stop="() => removeBreed(id)"
                            variant="secondary"
                            size="auto"
                        >
                            {{ breeds.find((b) => b.id === id)?.name }}
                        </AppButton>
                    </div>

                    <div class="flex-row gap-s">
                        <AppButton
                            @click="
                                selectedBreeds = [];
                                search = '';
                            "
                            variant="secondary"
                            full-width
                            >Reset</AppButton
                        >
                        <AppButton @click="applyFilter" variant="primary" full-width
                            >Apply</AppButton
                        >
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
    overflow: hidden;
    scrollbar-width: thin;
    z-index: 10;

    &__header,
    &__footer {
        padding: 1rem;
        background-color: $surface-2;
        z-index: 1;
    }

    &__header {
        padding-bottom: 0.5rem;

        .breeds-control {
            justify-content: space-between;
        }
    }

    &__main {
        flex: 1;
        position: relative;
        padding: 0.5rem 1rem;
        overflow-y: auto;

        .breed-list {
            list-style: none;
        }
    }

    &__footer {
        padding-top: 0.5rem;

        .selected-breeds {
            max-height: 80px;
            overflow-y: auto;
            scrollbar-width: thin;
        }
    }
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
