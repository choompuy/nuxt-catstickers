<script setup lang="ts">
import Skeleton from "~/components/base/Skeleton.vue";
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
        <Skeleton v-if="pending" />
        <Error v-else-if="error" :error="error" />
        <Editor v-else-if="cat" :cat="cat" />
    </div>
</template>

<style scoped lang="scss">
.sticker-page {
    width: 100dvw;
    height: 100dvh;
}
</style>
