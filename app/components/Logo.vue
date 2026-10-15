<script setup lang="ts">
import AppButton from "./base/AppButton.vue";

type AppButtonProps = InstanceType<typeof AppButton>["$props"];

interface Props {
    size?: AppButtonProps["size"];
}

withDefaults(defineProps<Props>(), {
    size: "medium",
});

const route = useRoute();

const goHome = async () => {
    if (route.path === "/") {
        if (window.scrollY >= 100) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (Object.keys(route.query).length > 0) {
            await navigateTo({ query: {} });
            return;
        }
        window.location.reload();
        return;
    }
    await navigateTo("/");
};
</script>

<template>
    <AppButton
        :key="route.fullPath"
        class="logo"
        @click="goHome"
        variant="link"
        :size="size"
        aria-label="Home"
    >
        <IconsCat />
        <h1 class="text-l text-weight-600">CatStickers</h1>
    </AppButton>
</template>
