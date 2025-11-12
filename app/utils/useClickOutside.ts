export function useClickOutside(targetRef: Ref<HTMLElement | null>, callback: (event: MouseEvent) => void, condition: Ref<boolean>) {
    const handler = (event: MouseEvent) => {
        const el = targetRef.value;
        if (!el) return;

        const isActive = condition.value;
        if (!isActive) return;

        if (!el.contains(event.target as Node)) {
            callback(event);
        }
    };

    const addEventListener = () => document.addEventListener("click", handler);
    const removeEventListener = () => document.removeEventListener("click", handler);

    onBeforeUnmount(() => removeEventListener());
    onDeactivated(() => removeEventListener());

    watch(condition, (value) => (value ? addEventListener() : removeEventListener()));
}
