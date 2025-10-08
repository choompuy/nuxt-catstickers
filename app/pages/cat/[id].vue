<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import AppCard from "~/components/base/AppCard.vue";
import AppImage from "~/components/base/AppImage.vue";
import Rating from "~/components/base/Rating.vue";
import Error from "~/components/Error.vue";
import FullImageViewer from "~/components/FullImageViewer.vue";

const route = useRoute();

const { data: cat, pending, error } = await useFetch(`/api/cat/${route.params.id}`);

const aspectRatio = ref(cat.value ? cat.value.width / cat.value.height : 0);
const catBreed = ref(cat.value?.breeds?.[0] || null);
const isFullVisible = ref(false);

const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
};
</script>

<template>
    <main class="flex-column gap-m exo2">
        <AppButton type="link" href="/" variant="secondary" size="small">
            <IconsArrowLeft />
        </AppButton>
        <div v-if="pending">Loading...</div>
        <Error v-else-if="error" :error="error" />
        <div v-else-if="cat" class="cat-container gap-m">
            <div class="start flex-column gap-s">
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
                    <AppButton @click="handleCopy(cat.url)" variant="secondary" size="small">
                        <p>Copy URL</p>
                        <IconsCopy />
                    </AppButton>
                    <AppButton @click="isFullVisible = true" variant="secondary" size="small">
                        <p>Expand</p>
                        <IconsExpand />
                    </AppButton>
                </div>

                <FullImageViewer
                    v-if="isFullVisible"
                    :src="cat.url"
                    :aspect-ratio="aspectRatio"
                    :visible="isFullVisible"
                    @close="isFullVisible = false"
                />
            </div>

            <AppCard title="Image">
                <ul class="list">
                    <li>
                        <p><strong>Width:</strong></p>
                        <p>{{ cat.width }}</p>
                    </li>
                    <li>
                        <p><strong>Height:</strong></p>
                        <p>{{ cat.height }}</p>
                    </li>
                    <li>
                        <p><strong>URL:</strong></p>
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

                <AppCard class="cat-info">
                    <h2 class="text-l">{{ catBreed.name }}</h2>
                    <p class="breed-description">{{ catBreed.description }}</p>
                    <ul class="list">
                        <li>
                            <p>
                                <strong>Origin:</strong>
                            </p>
                            <p>{{ catBreed.origin }} ({{ catBreed.country_code }})</p>
                        </li>
                        <li>
                            <p>
                                <strong>Weight:</strong>
                            </p>
                            <p>{{ catBreed.weight.metric }} kg</p>
                        </li>
                        <li>
                            <p>
                                <strong>Lifespan:</strong>
                            </p>
                            <p>{{ catBreed.life_span }} years</p>
                        </li>
                        <li>
                            <p>
                                <strong>Temperament:</strong>
                            </p>
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
    </main>
</template>

<style lang="scss" scoped>
.cat-container {
    display: grid;
    grid-template-columns: 1fr;

    .start {
        .image-actions {
            flex-wrap: wrap;
            justify-content: flex-end;
        }
    }

    .end {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: max-content;
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
    color: $secondary-text-color;
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

@media (width >= 600px) {
    .cat-container {
        grid-template-columns: 1fr 1fr;

        .start {
            grid-column: 2 span;
        }

        .cat-info {
            grid-column: 2 span;
        }
    }
}

@media (width >= 900px) {
    .cat-container {
        grid-template-columns: fit-content(50%) 1fr 1fr;
        grid-template-rows: repeat(3, max-content);

        .start {
            grid-column: 1 span;
            grid-row: 3 span;
        }

        .cat-info {
            grid-column: 2 span;
        }
    }
}

@media (width >= 1200px) {
}
</style>
