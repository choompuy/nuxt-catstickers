<script setup lang="ts">
import AppButton from "./base/AppButton.vue";

interface Props {
    iconOnly?: boolean;
}

const props = defineProps<Props>();

const route = useRoute();

const goHome = async () => {
    if (route.path === "/") {
        if (window.scrollY >= 100) window.scrollTo({ top: 0 });
        else {
            if (Object.keys(route.query).length > 0) await navigateTo({ query: {} });
            else window.location.reload();
        }
    } else {
        await navigateTo("/");
    }
};
</script>

<template>
    <AppButton class="logo" @click="goHome" variant="link" :icon-only="iconOnly" :title="iconOnly ? 'Go to home' : undefined" aria-label="Home">
        <IconsCat />
        <h1 v-if="!iconOnly" class="text-l text-weight-600">CatStickers</h1>
    </AppButton>
</template>

<style lang="scss" scoped></style>
