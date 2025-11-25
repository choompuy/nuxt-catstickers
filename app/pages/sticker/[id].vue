<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import Skeleton from "~/components/base/Skeleton.vue";
import GoBackButton from "~/components/GoBackButton.vue";
import Editor from "~/components/sticker/Editor.vue";

useHead({
    title: "Sticker",
    meta: [
        {
            name: "description",
            content: "",
        },
    ],
});

definePageMeta({
    layout: "blank",
});

const route = useRoute();

const {
    data: cat,
    pending,
    error,
} = await useFetch(`/api/cat/${route.params.id}`, {
    lazy: true,
    default() {},
});
</script>

<template>
    <div class="sticker-page flex-column">
        <div class="sticker-page__header flex-row gap-s">
            <GoBackButton />

            <div class="flex-row gap-s">
                <AppButton variant="text">Reset</AppButton>
                <AppButton variant="text">Save</AppButton>
            </div>
        </div>

        <div class="sticker-page__main">
            <Skeleton v-if="pending" />
            <Error v-else-if="error" :error="error" />
            <Editor v-else-if="cat" :cat="cat" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.sticker-page {
    width: 100vw;
    height: 100vh;

    &__header {
        flex-shrink: 0;
        justify-content: space-between;
        padding: 0.25rem;
        background-color: $surface-2;
        border-bottom: 1px $border-1;
    }

    &__main {
        flex: 1;
        position: relative;
        display: flex;
    }
}
</style>
