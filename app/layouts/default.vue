<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import Filter from "~/components/Filter.vue";

const route = useRoute();

const goHome = async () => {
    if (route.path === "/") {
        window.scrollY >= 100 ? window.scrollTo({ top: 0 }) : window.location.reload();
    } else {
        await navigateTo("/");
    }
};
</script>

<template>
    <header>
        <div class="header-content flex-row gap-m">
            <AppButton class="logo" @click="goHome" variant="text">
                <IconsCat />
                <h1 class="text-l text-weight-600">CatStickers</h1>
            </AppButton>
            <div class="end flex-row gap-s">
                <Filter v-if="$route.path === '/'" />
            </div>
        </div>
    </header>

    <main class="flex-column gap-m">
        <slot />
    </main>
</template>

<style lang="scss" scoped>
.header-content {
    justify-content: space-between;
    width: 100%;
    max-width: $page-max-width;
    margin-inline: auto;
    padding: 0.5rem 1rem;
}
</style>
