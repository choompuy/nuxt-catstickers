<script setup lang="ts" generic="T">
defineSlots<{
    default(props: { item: T; index: number }): any;
}>();

defineProps<{
    items: T[];
    getKey: (item: T) => string | number;
    listClass?: any;
    itemClass?: any | ((item: T) => any);
}>();
</script>

<template>
    <ClientOnly>
        <TransitionGroup tag="ul" name="list" :class="['list', listClass]" appear>
            <li
                v-for="(item, i) in items"
                :key="getKey(item)"
                :class="[
                    'list-item',
                    typeof itemClass === 'function' ? itemClass(item) : itemClass,
                ]"
            >
                <slot :item="item" :index="i" />
            </li>
        </TransitionGroup>
    </ClientOnly>
</template>

<style lang="scss" scoped>
.list {
    position: relative;
    max-height: 100%;
    list-style: none;
    contain: content;
    will-change: transform;
    overflow: auto;

    .list-item {
        width: 100%;
    }
}
</style>
