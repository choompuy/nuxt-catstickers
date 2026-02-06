<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import AppCard from "~/components/base/AppCard.vue";
import AppImage from "~/components/base/AppImage.vue";
import Rating from "~/components/base/Rating.vue";
import Skeleton from "~/components/base/Skeleton.vue";
import Error from "~/components/Error.vue";
import FullImageViewer from "~/components/FullImageViewer.vue";
import CatPreview from "~/components/CatPreview.vue";

const route = useRoute();

const {
    data: cat,
    pending,
    error,
} = await useFetch(`/api/cat/${route.params.id}`, {
    lazy: true,
});

const { cats, loading, loadCats } = useCats();

const aspectRatio = computed(() => {
    if (pending.value || !cat.value) return 0;
    return cat.value.width / cat.value.height;
});

const catBreed = computed(() => {
    if (pending.value || !cat.value) return null;
    return cat.value.breeds?.[0] || null;
});
const breedId = computed(() => catBreed.value?.id);
const isFullVisible = ref(false);

useHead({
    title: catBreed.value?.name || "Cat",
    meta: [
        {
            name: "description",
            content: catBreed.value?.description || "Cute and unique cat from gallery",
        },
    ],
});

const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
};

const handleLoadMore = async () => {
    await loadCats(breedId.value);
};
</script>

<template>
    <div class="flex-row gap-m">
        <GoBackButton />
        <h2 v-if="cat" class="text-l">{{ catBreed?.name || cat.id }}</h2>
    </div>

    <div v-if="pending" class="grid-loading gap-m">
        <Skeleton class="grid-main" border-radius=".75rem" />
        <Skeleton border-radius=".75rem" />
        <Skeleton border-radius=".75rem" />
    </div>
    <Error v-else-if="error" :error="error" />
    <template v-else-if="cat">
        <div class="cat-container gap-m">
            <FullImageViewer
                v-model:modal-visible="isFullVisible"
                :src="cat.url"
                :width="cat.width"
                :height="cat.height"
                :aspect-ratio="aspectRatio"
            />

            <div class="grid-main flex-column gap-s">
                <div
                    class="cat-image-container"
                    :style="{
                        aspectRatio: aspectRatio,
                    }"
                >
                    <AppImage
                        :src="cat.url"
                        :image-width="cat.width"
                        :image-height="cat.height"
                        :aspect-ratio="aspectRatio"
                        width="100%"
                        height="100%"
                        :alt="cat.breeds?.[0]?.name || 'Cat'"
                        border-radius="0.75rem"
                        fit-mode="contain"
                    />
                </div>
                <div class="image-actions flex-row gap-s text-s">
                    <AppButton :href="`/sticker/${route.params.id}`" type="link" variant="secondary">
                        <p>Make sticker</p>
                        <IconsSticker />
                    </AppButton>
                    <AppButton @click="handleCopy(cat.url)" variant="secondary">
                        <p>Copy URL</p>
                        <IconsCopy />
                    </AppButton>
                    <AppButton @click="isFullVisible = true" variant="secondary">
                        <p>Expand</p>
                        <IconsExpand />
                    </AppButton>
                </div>
            </div>

            <AppCard title="Image">
                <ul class="list">
                    <li>
                        <p class="text-weight-600">Width:</p>
                        <p>{{ cat.width }}</p>
                    </li>
                    <li>
                        <p class="text-weight-600">Height:</p>
                        <p>{{ cat.height }}</p>
                    </li>
                    <li>
                        <p class="text-weight-600">URL:</p>
                        <NuxtLink class="text-overflow" :to="cat.url" target="_blank">{{ cat.url.replace("https://", "") }}</NuxtLink>
                    </li>
                </ul>
            </AppCard>

            <AppCard v-if="!catBreed" class="no-info">
                <p style="text-align: center">No breed info</p>
            </AppCard>
            <template v-else>
                <AppCard class="stats" title="Stats">
                    <ul class="list">
                        <li>
                            <p>Affection:</p>
                            <Rating name="affection_level" :length="5" :rating="catBreed.affection_level" />
                        </li>
                        <li>
                            <p>Energy:</p>
                            <Rating name="energy_level" :length="5" :rating="catBreed.energy_level" />
                        </li>
                        <li>
                            <p>Intelligence:</p>
                            <Rating name="intelligence" :length="5" :rating="catBreed.intelligence" />
                        </li>
                        <li>
                            <p>Child friendly:</p>
                            <Rating name="child_friendly" :length="5" :rating="catBreed.child_friendly" />
                        </li>
                        <li>
                            <p>Dog friendly:</p>
                            <Rating name="dog_friendly" :length="5" :rating="catBreed.dog_friendly" />
                        </li>
                    </ul>
                </AppCard>

                <AppCard class="cat-info" title="Description">
                    <p class="breed-description">{{ catBreed.description }}</p>
                    <ul class="list">
                        <li>
                            <p class="text-weight-600">Origin:</p>
                            <p>{{ catBreed.origin }} ({{ catBreed.country_code }})</p>
                        </li>
                        <li>
                            <p class="text-weight-600">Weight:</p>
                            <p>{{ catBreed.weight.metric }} kg</p>
                        </li>
                        <li>
                            <p class="text-weight-600">Lifespan:</p>
                            <p>{{ catBreed.life_span }} years</p>
                        </li>
                        <li>
                            <p class="text-weight-600">Temperament:</p>
                            <p>
                                {{ catBreed.temperament }}
                            </p>
                        </li>
                    </ul>
                </AppCard>

                <AppCard title="More info">
                    <div class="flex-row gap-s">
                        <a v-if="catBreed.wikipedia_url" :href="catBreed.wikipedia_url" target="_blank">Wikipedia</a>
                        <a v-if="catBreed.cfa_url" :href="catBreed.cfa_url" target="_blank">CFA</a>
                        <a v-if="catBreed.vcahospitals_url" :href="catBreed.vcahospitals_url" target="_blank">VCA</a>
                    </div>
                </AppCard>
            </template>
        </div>

        <Masonry :items="cats.filter((v) => v.id !== cat?.id)" @load-more="handleLoadMore" :loading="loading">
            <template #default="{ cat }">
                <CatPreview :cat="cat" />
            </template>
        </Masonry>
    </template>
</template>

<style lang="scss" scoped>
$image-height: 45vh;
$row-height: 120px;

.grid-loading,
.cat-container {
    display: grid;
    grid-template-columns: 1fr;
}

.grid-loading {
    grid-template-rows: $image-height $row-height $row-height;
    width: 100%;
}

.grid-main {
    .image-actions {
        flex-wrap: wrap;
        justify-content: flex-end;
    }
}

.cat-image-container {
    align-content: center;
    width: 100%;
    max-height: 50vh;
}

.no-info {
    justify-content: center;
    align-items: center;
    color: $text-secondary;
}

.list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    list-style: none;

    li {
        display: inline-flex;
        gap: 0.5rem;
    }
}

.stats li {
    justify-content: space-between;
}

@media (width >= breakpoint(mobile)) {
    .grid-loading {
        grid-template-rows: $image-height $row-height;
    }

    .cat-container,
    .grid-loading {
        grid-template-columns: 1fr 1fr;
    }

    .grid-main {
        grid-column: 2 span;
    }

    .cat-info {
        grid-column: 2 span;
    }
}

@media (width >= breakpoint(tablet)) {
    .grid-loading {
        grid-template-columns: 2fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        height: $image-height;
    }

    .cat-container {
        grid-template-columns: fit-content(50%) 1fr 1fr;
        grid-template-rows: repeat(3, max-content);
    }

    .grid-main {
        grid-column: 1 span;
        grid-row: 3 span;
    }

    .cat-info {
        grid-column: 2 span;
    }
}
</style>
