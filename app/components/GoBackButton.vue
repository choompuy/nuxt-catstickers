<script setup lang="ts">
import AppButton from "./base/AppButton.vue";

const router = useRouter();

const goBackOrHome = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push("/");
    }
};
</script>

<template>
    <AppButton @click="goBackOrHome()" variant="secondary" title="Go back" aria-label="Back" iconOnly>
        <IconsArrowLeft />
    </AppButton>
</template>

<style lang="scss" scoped></style>
