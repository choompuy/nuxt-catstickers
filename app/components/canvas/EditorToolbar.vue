<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import { TOOLS } from "~/constants/editor";

defineProps<{
    core: ReturnType<typeof useCanvas>["core"];
}>();
</script>

<template>
    <div class="left-bar flex-column gap-xs border-right">
        <AppButton
            v-for="tool in TOOLS"
            :key="tool.mode"
            variant="state"
            icon-only
            :active="core.currentMode.value === tool.mode"
            :title="tool.title"
            :aria-label="tool.title"
            @click="core.switchMode(tool.mode)"
        >
            <component :is="tool.icon" />
        </AppButton>
    </div>
</template>
