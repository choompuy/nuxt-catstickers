// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: false },

    app: {
        head: {
            title: "CatStickers",
            meta: [
                {
                    name: "description",
                    content: "Cat gallery with Masonry layout",
                },
            ],
            htmlAttrs: {
                lang: "en",
            },
        },
    },

    css: ["~/assets/styles/index.scss"],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "~/assets/styles/variables.scss" as *; @use "~/assets/styles/mixins.scss" as *;`,
                },
            },
        },
    },

    image: {
        domains: ["cdn2.thecatapi.com"],
        format: ["webp"],
        quality: 75,
    },

    typescript: {
        strict: true,
    },

    modules: ["@nuxt/image"],
});
