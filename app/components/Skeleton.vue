<template>
    <div class="skeleton"></div>
</template>

<style lang="scss" scoped>
.skeleton {
    position: absolute;
    inset: 0;
    background-color: $surface-1;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        background-color: $surface-1;
    }
    50% {
        background-color: $surface-2;
    }
    100% {
        background-color: $surface-1;
    }
}
</style>
