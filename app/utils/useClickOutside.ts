export function useClickOutside(
    targetRef: Ref<HTMLElement | null>,
    callback: (event: MouseEvent) => void,
    condition?: Ref<boolean | undefined> | (() => boolean)
) {
    const handler = (event: MouseEvent) => {
        const el = targetRef.value;
        if (!el) return;

        const isActive = condition === undefined ? true : typeof condition === "function" ? condition() : condition.value;
        if (!isActive) return;

        if (!el.contains(event.target as Node)) {
            callback(event);
        }
    };

    const addEventListener = () => document.addEventListener("click", handler);
    const removeEventListener = () => document.removeEventListener("click", handler);

    onBeforeUnmount(() => removeEventListener());
    onDeactivated(() => removeEventListener());

    if (condition && typeof condition !== "function") {
        watch(condition, (val) => (!val ? removeEventListener() : addEventListener()));
    }
}
