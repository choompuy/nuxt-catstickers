<script setup lang="ts">
import Search from "~/components/Search.vue";
import AppButton from "~/components/base/AppButton.vue";

const route = useRoute();
const router = useRouter();

const goHome = async () => {
    if (route.path === "/") {
        window.scrollTo({ top: 0 });
    } else {
        router.push("/");
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
            <Search />
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
