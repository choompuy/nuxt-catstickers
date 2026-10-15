<script setup lang="ts">
import AppSection from "~/components/base/AppSection.vue";
import AppList from "~/components/base/AppList.vue";
import AppButton from "~/components/base/AppButton.vue";
import type { CanvasHistoryListEntry } from "~/types/canvas";
import { TOOL_ICON_MAP } from "~/constants/editor";

const props = defineProps<{
    history: ReturnType<typeof useCanvas>["history"];
}>();

const { exposed, goTo } = props.history;

const list = computed<CanvasHistoryListEntry[]>(() => exposed.list.value);

function getHistoryKey(entry: CanvasHistoryListEntry) {
    return entry.index;
}

function getHistoryItemClass(entry: CanvasHistoryListEntry) {
    return [
        "border-bottom",
        {
            future: entry.isFuture,
        },
    ];
}
</script>

<template>
    <div class="history">
        <AppSection class="history-section">
            <AppList
                :items="list"
                :getKey="getHistoryKey"
                list-class="history-list"
                :item-class="getHistoryItemClass"
            >
                <template #default="{ item: h }">
                    <AppButton
                        :active="h.isActive"
                        variant="outline"
                        border-radius="none"
                        full-width
                        @click="goTo(h.index)"
                    >
                        <div class="start flex-row gap-s">
                            <span v-if="h.timestamp" class="text-secondary text-xs">
                                {{ getFormattedValue("time", h.timestamp) }}
                            </span>

                            <span class="text-s text-overflow">
                                {{ h.label || "No description" }}
                            </span>
                        </div>

                        <component v-if="h.mode" :is="TOOL_ICON_MAP[h.mode]" class="end" />
                    </AppButton>
                </template>
            </AppList>
        </AppSection>
    </div>
</template>

<style lang="scss" scoped>
.history {
    display: flex;
    max-height: 100%;
    overflow: hidden;

    .history-section {
        flex: 1;

        :deep(.history-list) {
            max-height: 100%;
            padding-bottom: 1rem;
            overflow: auto;

            .future {
                opacity: 0.4;
            }
        }
    }
}
</style>
