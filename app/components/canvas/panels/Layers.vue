<script setup lang="ts">
import AppSection from "~/components/base/AppSection.vue";
import AppList from "~/components/base/AppList.vue";
import AppButton from "~/components/base/AppButton.vue";
import type { CanvasLayerEntry } from "~/types/canvas";
import { LAYER_ICON_MAP } from "~/constants/editor";

import Eye from "~/components/icons/Eye.vue";
import EyeSlash from "~/components/icons/EyeSlash.vue";

const props = defineProps<{
    layers: ReturnType<typeof useCanvas>["layers"];
}>();

const { selectedObject, layersList, selectObject, toggleVisibility } = props.layers;

const list = computed<CanvasLayerEntry[]>(() => layersList.value);

function getLayerName(layer: CanvasLayerEntry) {
    if (layer.type === "textbox") {
        return layer.object.text?.trim() || layer.label;
    }
    return layer.label;
}

function getLayerKey(layer: CanvasLayerEntry) {
    return layer.id;
}
</script>

<template>
    <div class="layers">
        <AppSection>
            <AppList
                :items="list"
                :getKey="getLayerKey"
                list-class="layers-list"
                item-class="border-bottom"
            >
                <template #default="{ item: l }">
                    <AppButton
                        as="div"
                        variant="outline"
                        border-radius="none"
                        full-width
                        :active="l.id === selectedObject.state?.ID"
                        @click="selectObject(l.id)"
                    >
                        <div class="start flex-row gap-s">
                            <component :is="LAYER_ICON_MAP[l.type]" class="layer-type" />

                            <div class="layer-info flex-column">
                                <span class="layer-name text-overflow">
                                    {{ getLayerName(l) }}
                                </span>
                                <span class="text-secondary text-xs">
                                    {{ l.type }}
                                </span>
                            </div>
                        </div>

                        <AppButton
                            class="end"
                            :title="l.visible ? 'Hide layer' : 'Show layer'"
                            variant="state"
                            size="small"
                            icon-only
                            @click.stop="() => toggleVisibility(l.id)"
                        >
                            <Eye v-if="l.visible !== false" />
                            <EyeSlash v-else />
                        </AppButton>
                    </AppButton>
                </template>
            </AppList>
        </AppSection>
    </div>
</template>

<style lang="scss" scoped>
.layers {
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.section) {
        min-height: 0;
    }

    :deep(.section:first-child) {
        flex: 2;
    }

    :deep(.section:last-child) {
        flex: 1;
    }

    :deep(.section-body) {
        height: 100%;
        overflow: auto;
    }

    :deep(.layers-list) {
        height: 100%;
        padding-bottom: 1rem;
        overflow: auto;
    }

    :deep(.properties-panel) {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.75rem;
    }

    .properties-empty {
        justify-content: center;
        min-height: 100%;
        padding: 0.75rem;
    }
}
</style>
