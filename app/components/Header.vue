<script setup lang="ts">
import Logo from "./Logo.vue";
import Filter from "./home/Filter.vue";
import ActiveFilters from "./home/ActiveFilters.vue";

const route = useRoute();
</script>

<template>
    <header>
        <div class="header-content flex-column gap-s">
            <div class="header-content__start flex-row gap-m">
                <Logo variant="text" />

                <div v-if="route.path === '/'" class="flex-row gap-s">
                    <Filter />
                </div>
            </div>

            <ActiveFilters v-if="route.path === '/'" />
        </div>
    </header>
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
