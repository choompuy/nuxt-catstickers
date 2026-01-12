<script setup lang="ts">
import type { AppButtonVariant } from "~/types/appButton";
import AppButton from "./base/AppButton.vue";

interface Props {
    variant?: AppButtonVariant;
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
    <AppButton
        class="logo"
        @click="goHome"
        :variant="variant"
        :icon-only="iconOnly"
        :hint="iconOnly ? 'Go to home' : undefined"
        hintPos="bottom"
        aria-label="Home"
    >
        <IconsCat />
        <h1 v-if="!iconOnly" class="text-l text-weight-600">CatStickers</h1>
    </AppButton>
</template>
