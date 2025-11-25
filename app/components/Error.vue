<script setup lang="ts">
import type { NuxtError } from "#app";
import type { FetchError } from "ofetch";
import AppButton from "./base/AppButton.vue";

interface Props {
    error: FetchError | NuxtError;
}

const props = defineProps<Props>();

onMounted(() => {
    console.error(props.error.message);
});
</script>

<template>
    <div class="error-container">
        <div class="error-wrapper flex-column">
            <div class="error-header flex-row gap-s">
                <h1 class="text-l text-weight-600">⚠️ Error code: {{ error.statusCode || 0 }}</h1>
                <div class="error-buttons flex-row gap-xs">
                    <span class="error-button green"></span>
                    <span class="error-button orange"></span>
                    <span class="error-button red"></span>
                </div>
            </div>
            <div class="error-content flex-column gap-s">
                <div class="error-message">
                    <h2 class="text-m text-weight-500">
                        {{ error.statusMessage || "Unknown error" }}
                    </h2>
                </div>
                <div class="error-actions text-weight-500">
                    <AppButton type="link" href="/" variant="secondary">Go back home</AppButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$inner-color: $surface-3;

.error-container {
    display: flex;
    width: 100%;
    max-width: 400px;
    min-height: 250px;
    margin: auto;
    background-color: $onSurface-0;
    border: $border-2;
    border-radius: 1rem;
    overflow: hidden;
}

.error-wrapper {
    flex: 1;
    border: 0.5rem solid $inner-color;
    border-top-width: 0.25rem;

    .error-header {
        justify-content: space-between;
        padding-inline: 0.5rem;
        padding-bottom: 0.25rem;
        background-color: $inner-color;

        .error-button {
            width: 0.875rem;
            height: 0.875rem;
            border-radius: 50%;
        }

        .error-button.green {
            background-color: $green;
        }
        .error-button.orange {
            background-color: $orange;
        }
        .error-button.red {
            background-color: $red;
        }
    }

    .error-content {
        flex: 1;
        justify-content: space-between;
        padding: 0.5rem;
        background-color: $surface-1;
        text-align: center;

        .error-message {
            margin: auto;
        }

        .error-actions {
            margin-inline: auto;
        }
    }
}
</style>
