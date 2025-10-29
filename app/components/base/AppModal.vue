<script setup lang="ts">
import { Teleport, Transition } from "vue";
import AppButton from "./AppButton.vue";

interface Props {
    teleportTo?: string;
}

defineProps<Props>();
const visible = defineModel<boolean>("visible");

const close = () => {
    visible.value = false;
    document.body.style.overflow = "";
};

const show = () => {
    document.body.style.overflow = "hidden";
};

watch(
    () => visible.value,
    (value) => (value ? show() : close())
);

onDeactivated(close);
onBeforeUnmount(close);

useKeyDown(["Escape"], close, visible);
</script>

<template>
    <Teleport :to="teleportTo || 'body'">
        <Transition name="fade">
            <div v-if="visible" class="overlay">
                <div id="modalContainer" class="container">
                    <slot />
                </div>

                <div class="controls flex-column gap-s">
                    <AppButton @click="close" variant="transparent" size="small">
                        <IconsClose />
                    </AppButton>

                    <slot name="controls" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style lang="scss" scoped>
.overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: $backdrop-color;
    backdrop-filter: blur(4px);
    z-index: 9999;
}

.container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
}
</style>
