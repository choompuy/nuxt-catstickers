<script setup lang="ts">
import AppButton from "~/components/base/AppButton.vue";
import AppCheckbox from "~/components/base/AppCheckbox.vue";
import AppInput from "~/components/base/AppInput.vue";
import Text from "~/components/icons/Text.vue";
import Angle from "~/components/icons/Angle.vue";
import ArrowUp from "~/components/icons/ArrowUp.vue";
import AppColorPicker from "~/components/base/AppColorPicker.vue";
import type { ObjectTextboxState } from "~/types/canvasObject";

const props = defineProps<{
    state: ObjectTextboxState;
    update: (key: keyof ObjectTextboxState, value: any) => void;
}>();
</script>

<template>
    <section class="property-section">
        <AppButton variant="outline" border-radius="none">
            <div class="start">Transform</div>
            <div class="end"><ArrowUp /></div>
        </AppButton>

        <div class="property-group">
            <AppInput
                id="fontSize"
                type="number"
                :value="state.fontSize"
                @change="(v) => update('fontSize', v)"
                :min="1"
            >
                <template #left><Text /></template>
            </AppInput>

            <AppInput
                id="angle"
                type="number"
                :value="state.angle"
                suffix="°"
                @change="
                    (v) => {
                        if (typeof v !== 'number') return;
                        update('angle', ((v % 360) + 360) % 360);
                    }
                "
            >
                <template #left><Angle /></template>
            </AppInput>

            <AppInput
                id="left"
                type="number"
                :value="state.left"
                @change="(v) => update('left', v)"
            >
                <template #left>X</template>
            </AppInput>

            <AppInput id="top" type="number" :value="state.top" @change="(v) => update('top', v)">
                <template #left>Y</template>
            </AppInput>
        </div>
    </section>

    <section class="property-section">
        <AppButton variant="outline" border-radius="none"> Appearance </AppButton>

        <div class="field">
            <span>Text Color</span>
            <AppColorPicker
                id="fill"
                :value="state.fill || '#ffffff'"
                @input="(v) => update('fill', v)"
                @change="(v) => update('fill', v)"
            />
        </div>

        <div class="field">
            <span>Stroke Color</span>
            <AppColorPicker
                id="stroke"
                :value="state.stroke || '#ffffff'"
                @input="(v) => update('stroke', v)"
                @change="(v) => update('stroke', v)"
            />
        </div>

        <div class="property-group">
            <div class="field">
                <span>Fill</span>
                <AppColorPicker
                    id="backgroundColor"
                    :value="state.backgroundColor || '#ffffff'"
                    @input="(v) => update('backgroundColor', v)"
                    @change="(v) => update('backgroundColor', v)"
                />
            </div>

            <div class="field">
                <span>Opacity</span>
                <AppInput
                    id="opacity"
                    type="number"
                    :value="state.opacity * 100"
                    :min="0"
                    :max="100"
                    suffix="%"
                    @change="
                        (v) => {
                            if (typeof v !== 'number') return;
                            update('opacity', (Math.round(v) / 100).toFixed(2));
                        }
                    "
                >
                    <template #left>O</template>
                </AppInput>
            </div>
        </div>

        <div class="toggle">
            <AppCheckbox id="visible" @change="(v) => update('visible', v)" />
            <span>Visible</span>
        </div>
    </section>
</template>

<style lang="scss" scoped>
.property-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.toggle {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
        width: 1rem;
        height: 1rem;
    }

    span {
        font-size: 0.8rem;
        color: $text-primary;
    }
}
</style>
