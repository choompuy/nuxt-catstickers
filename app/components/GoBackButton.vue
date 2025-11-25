<script setup lang="ts">
import AppButton from '~/components/base/AppButton.vue';
import ArrowLeft from './icons/ArrowLeft.vue';

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
    <AppButton label="Back" @click="goBackOrHome()" variant="secondary">
        <ArrowLeft />
    </AppButton>
</template>
