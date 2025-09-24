<script setup lang="ts"></script>

<template>
    <main class="flex-column gap-l">
        <h1 class="exo2-900 text-2xl">Страница со стикером</h1>

        <Sticker />

        <div class="flex-column gap-m">
            <div v-for="n in 15" :key="n" class="card">
                <h3>Блок {{ n }}</h3>
                <p>Контент внутри блока {{ n }}</p>
            </div>
        </div>
    </main>
</template>

<style scoped lang="scss">
main {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    padding: 1em;

    .card {
        background: $surface-1;
        color: $onSurface-0;
        padding: 1rem;
        border-radius: 0.5rem;
    }
}
</style>
