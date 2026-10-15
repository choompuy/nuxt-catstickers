<script setup lang="ts">
const props = defineProps<{
    object: Record<string, any>;
    id: string;
    update: (id: string, patch: any, meta?: { label?: string }) => void;
    preview: (id: string, patch: any) => void;
    commitPreview: (id: string, meta?: { label?: string }) => void;
}>();

const isEllipse = computed(() => props.object.type === "ellipse");
const isRect = computed(() => props.object.type === "rect");

function updateNumber(key: string, label: string, event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    props.update(props.id, { [key]: Number(target.value) }, { label });
}

function updateBoolean(key: string, labelTrue: string, labelFalse: string, event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    props.update(
        props.id,
        { [key]: target.checked },
        { label: target.checked ? labelTrue : labelFalse }
    );
}

function previewOpacity(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    props.preview(props.id, { opacity: Number(target.value) });
}

function commitOpacity() {
    props.commitPreview(props.id, { label: "Change shape opacity" });
}
</script>

<template>
    <div class="properties-panel">
        <div class="property-group">
            <div class="property-group__header">
                <h4>Transform</h4>
            </div>

            <div class="property-grid">
                <label class="field">
                    <span>X</span>
                    <input
                        type="number"
                        step="1"
                        :value="object.left ?? 0"
                        @change="updateNumber('left', 'Move shape horizontally', $event)"
                    />
                </label>

                <label class="field">
                    <span>Y</span>
                    <input
                        type="number"
                        step="1"
                        :value="object.top ?? 0"
                        @change="updateNumber('top', 'Move shape vertically', $event)"
                    />
                </label>

                <label v-if="isRect" class="field">
                    <span>Width</span>
                    <input
                        type="number"
                        step="1"
                        :value="object.width ?? 0"
                        @change="updateNumber('width', 'Resize shape width', $event)"
                    />
                </label>

                <label v-if="isRect" class="field">
                    <span>Height</span>
                    <input
                        type="number"
                        step="1"
                        :value="object.height ?? 0"
                        @change="updateNumber('height', 'Resize shape height', $event)"
                    />
                </label>

                <label v-if="isEllipse" class="field">
                    <span>Radius X</span>
                    <input
                        type="number"
                        step="1"
                        :value="object.rx ?? 0"
                        @change="updateNumber('rx', 'Change horizontal radius', $event)"
                    />
                </label>

                <label v-if="isEllipse" class="field">
                    <span>Radius Y</span>
                    <input
                        type="number"
                        step="1"
                        :value="object.ry ?? 0"
                        @change="updateNumber('ry', 'Change vertical radius', $event)"
                    />
                </label>

                <label v-if="!isRect && !isEllipse" class="field">
                    <span>Scale X</span>
                    <input
                        type="number"
                        step="0.05"
                        :value="object.scaleX ?? 1"
                        @change="updateNumber('scaleX', 'Scale shape horizontally', $event)"
                    />
                </label>

                <label v-if="!isRect && !isEllipse" class="field">
                    <span>Scale Y</span>
                    <input
                        type="number"
                        step="0.05"
                        :value="object.scaleY ?? 1"
                        @change="updateNumber('scaleY', 'Scale shape vertically', $event)"
                    />
                </label>

                <label class="field">
                    <span>Angle</span>
                    <input
                        type="number"
                        step="1"
                        :value="object.angle ?? 0"
                        @change="updateNumber('angle', 'Rotate shape', $event)"
                    />
                </label>

                <label class="field">
                    <span>Opacity</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        :value="object.opacity ?? 1"
                        @input="previewOpacity"
                        @change="commitOpacity"
                    />
                    <strong>{{ Math.round((object.opacity ?? 1) * 100) }}%</strong>
                </label>
            </div>
        </div>

        <div class="property-group">
            <div class="property-group__header">
                <h4>Options</h4>
            </div>

            <label class="toggle">
                <input
                    type="checkbox"
                    :checked="object.visible !== false"
                    @change="updateBoolean('visible', 'Show shape', 'Hide shape', $event)"
                />
                <span>Visible</span>
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.properties-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
}

.property-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid $surface-3;
    border-radius: 0.875rem;
    background: color-mix(in srgb, $surface-1 88%, $surface-0 12%);

    &__header h4 {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: $text-secondary;
    }
}

.property-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;

    span {
        font-size: 0.75rem;
        color: $text-secondary;
    }

    strong {
        font-size: 0.75rem;
        color: $text-primary;
    }

    input {
        width: 100%;
        min-height: $button-height-small;
        padding: 0.45rem 0.625rem;
        border: 1px solid $surface-3;
        border-radius: 0.625rem;
        background: $surface-0;
        color: $text-primary;
    }

    input[type="range"] {
        padding-inline: 0;
    }
}

.toggle {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.875rem;
    color: $text-primary;

    input {
        width: 1rem;
        height: 1rem;
        accent-color: $text-primary;
    }
}
</style>
