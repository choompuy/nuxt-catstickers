<script setup lang="ts">
import type { Component } from "vue";
import type { CanvasObjectTypes, CanvasObjectStateKeys } from "~/types/canvasObject";
import { LAYOUT_FIELDS, TYPOGRAPHY_FIELDS } from "./properties/PropertiesFields";
import AppSection from "~/components/base/AppSection.vue";
import AppButton from "~/components/base/AppButton.vue";
import PropertyField from "./properties/PropertyField.vue";
import ArrowUp from "~/components/icons/ArrowUp.vue";

const props = defineProps<{
    layers: ReturnType<typeof useCanvas>["layers"];
}>();

const { selectedObject, updateObject } = props.layers;

const PROPERTIES_MAP = {
    scene: [LAYOUT_FIELDS],
    fabricobject: [LAYOUT_FIELDS],
    image: [LAYOUT_FIELDS],
    rect: [LAYOUT_FIELDS],
    ellipse: [LAYOUT_FIELDS],
    path: [LAYOUT_FIELDS],
    textbox: [LAYOUT_FIELDS, TYPOGRAPHY_FIELDS],
} satisfies Record<CanvasObjectTypes | "scene", Component>;

function update<K extends CanvasObjectStateKeys>(key: K, value: K) {
    if (!selectedObject.value.state?.ID || value == null) return;

    console.log({ key, value });

    updateObject(selectedObject.value.state.ID, {
        [key]: value,
    });
}
</script>

<template>
    <AppSection title="Properties" class="border-top">
        <template v-if="selectedObject.state != null">
            <section
                class="property-section"
                v-for="p in PROPERTIES_MAP[selectedObject.type || 'scene']"
                :key="p.label"
            >
                <AppButton variant="outline" border-radius="none">
                    <div class="start">{{ p.label }}</div>
                    <div class="end"><ArrowUp /></div>
                </AppButton>

                <PropertyField
                    v-for="f in p.fields"
                    :key="f.key"
                    :state="selectedObject.state"
                    :field="f"
                    @update="(v) => update(f.key, v)"
                />
            </section>
        </template>
        <!-- <component
            v-if="selectedObject.state?.ID && selectedObject.type"
            :is="PROPERTIES_MAP[selectedObject.type]"
            :key="selectedObject.state.ID"
            :state="state"
            :update="update"
        />
        <component v-else :is="PROPERTIES_MAP.scene" /> -->
    </AppSection>
</template>

<style lang="scss" scoped>
.property-section {
    display: flex;
    flex-direction: column;
    padding-bottom: 0.5rem;
    border-bottom: 1px $border-1;

    .property-label {
        display: flex;
        align-items: center;
        padding: 0 0.5rem;
        border-bottom: 1px $border-1;
        color: $text-primary;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .property-group {
        padding: 0 0.5rem;
    }
}

.property-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid $surface-3;
    border-radius: 0.875rem;
    background: color-mix(in srgb, $surface-1 88%, $surface-0 12%);

    &--hint {
        gap: 0.375rem;
    }

    &__header h4 {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: $text-secondary;
    }
}
</style>
