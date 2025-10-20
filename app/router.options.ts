import type { RouterScrollBehavior } from "vue-router";

export default {
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return { ...savedPosition, behavior: "instant" };

        if (to.fullPath === from.fullPath) {
            return false;
        }

        return { top: 0, behavior: "instant" };
    },
} satisfies { scrollBehavior: RouterScrollBehavior };
