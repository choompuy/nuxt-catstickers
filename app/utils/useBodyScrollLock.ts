import { BREAKPOINTS } from "~/constants/breakpoints";

export function useBodyScrollLock(isFilterOpen: Ref<boolean>) {
    const lockScroll = () => {
        document.body.style.overflow = "hidden";
    };

    const unlockScroll = () => {
        document.body.style.overflow = "";
    };

    const handleScrollLock = () => {
        const isMobile = window.innerWidth < BREAKPOINTS.mobile;
        if (isMobile && isFilterOpen.value) lockScroll();
        else unlockScroll();
    };

    const addEventListener = () => {
        handleScrollLock();
        window.addEventListener("resize", handleScrollLock);
    };
    const removeEventListener = () => {
        unlockScroll();
        window.removeEventListener("resize", handleScrollLock);
    };

    onBeforeUnmount(() => removeEventListener());
    onDeactivated(() => removeEventListener());

    watch(isFilterOpen, (value) => (value ? addEventListener() : removeEventListener()));
}
