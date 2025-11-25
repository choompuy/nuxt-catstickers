<script setup lang="ts">
import type { Cat } from '~/types/cat';

interface Props {
    cat: Cat;
}

const props = defineProps<Props>();
</script>

<template>
    <div>
        {{ cat.url }}
    </div>
</template>


<style scoped>
.editor-wrapper {
    width: 100%;
    height: 100%;
}
button {
    margin-top: 8px;
    padding: 6px 14px;
}
</style>
