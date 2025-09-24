<script setup lang="ts">
const imageCount = 3;
const { data, pending, error } = useFetch(`/api/sticker?limit=${imageCount}`);

const images = computed(() => {
    if (pending.value) {
        return Array(imageCount).fill(null);
    }
    return data.value?.images ?? [];
});
</script>

<template>
    <div class="sticker flex-column gap-m">
        <h1 class="sticker-title exo2-900 text-2xl">Консультация эксперта</h1>

        <div class="label">
            <div v-if="!error" class="images flex-row">
                <AppImage
                    v-for="(url, idx) in images"
                    :key="idx"
                    :src="url"
                    alt="Random cat"
                    :lazy="true"
                    :width="128"
                    :height="128"
                    :rounded="true"
                />
            </div>
            <div v-else>{{ error }}</div>
        </div>

        <button class="button exo2-700 text-m" type="button">Получить консультацию</button>
    </div>
</template>

<style lang="scss" scoped>
.sticker {
    align-items: center;
    margin-inline: auto;
    padding: 1rem;
    border-radius: 1rem;
    color: $onPrimary;
    background-color: $primary-color;
    text-align: center;

    .sticker-title {
        text-transform: uppercase;
    }

    .images .app-image:not(:first-child) {
        margin-left: -12px;
    }

    .button {
        width: auto;
        color: $surface-0;
        background-color: $onSurface-0;
        border: none;
        height: $button-height;
        padding-inline: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 0 0 0 #7373731a;
    }
}
</style>
