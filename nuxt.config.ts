// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },

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
                    additionalData: `@use "~/assets/styles/variables.scss" as *;`,
                },
            },
        },
    },

    typescript: {
        strict: true,
    },

    modules: ["@nuxt/image"],
});
