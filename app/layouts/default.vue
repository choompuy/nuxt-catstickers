<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import Filter from "~/components/Filter.vue";
import ActiveFilters from "~/components/ActiveFilters.vue";

const route = useRoute();

const { breeds } = useBreeds();
provide("breeds", breeds);

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
    <header>
        <div class="header-content flex-column gap-s">
            <div class="header-content__start flex-row gap-m">
                <AppButton class="logo" @click="goHome" variant="text" size="small">
                    <IconsCat />
                    <h1 class="text-l text-weight-600">CatStickers</h1>
                </AppButton>

                <div v-if="$route.path === '/'" class="flex-row gap-s">
                    <Filter />
                </div>
            </div>

            <ActiveFilters v-if="route.path === '/'" />
        </div>
    </header>

    <main class="flex-column gap-m">
        <slot />
    </main>
</template>

<style lang="scss" scoped>
.header-content {
    width: 100%;
    max-width: $page-max-width;
    margin-inline: auto;
    padding: 0.5rem 1rem;

    &__start {
        justify-content: space-between;
    }
}
</style>
