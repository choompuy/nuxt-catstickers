<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import Logo from "~/components/Logo.vue";
import Undo from "~/components/icons/Undo.vue";
import Redo from "~/components/icons/Redo.vue";

const props = defineProps<{
    canvas: ReturnType<typeof useCanvas>;
}>();

const historyActions = [
    { action: () => props.canvas.history.undo(), label: "Undo", icon: Undo },
    { action: () => props.canvas.history.redo(), label: "Redo", icon: Redo },
] as const;
</script>

<template>
    <div class="header flex-row gap-m border-bottom">
        <div class="start flex-row gap-m">
            <Logo size="small" />
            <AppButton variant="state" size="small" class="text-secondary">Reset</AppButton>
        </div>

        <div class="end flex-row gap-m">
            <div class="flex-row gap-s">
                <AppButton
                    v-for="{ action, icon, label } in historyActions"
                    :key="label"
                    variant="state"
                    size="small"
                    icon-only
                    :title="label"
                    :aria-label="label"
                    :disabled="!props.canvas.history.exposed[`can${label}`].value"
                    @click="action()"
                >
                    <component :is="icon" />
                </AppButton>
            </div>
            <AppButton variant="primary" size="small">Export</AppButton>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.header {
    width: 100%;
    padding: 0.5rem;
    background-color: $surface-0;
}
</style>
