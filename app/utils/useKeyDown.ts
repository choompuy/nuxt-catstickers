export function useKeyDown(
    keys: string[] | string,
    callback: (event: KeyboardEvent) => void,
    condition?: Ref<boolean | undefined> | (() => boolean)
) {
    const keyList = Array.isArray(keys) ? keys : [keys];

    const handler = (event: KeyboardEvent) => {
        const isActive = condition === undefined ? true : typeof condition === "function" ? condition() : condition.value;

        if (!isActive) return;

        if (keyList.includes(event.key)) {
            callback(event);
        }
    };

    const addEventListener = () => document.addEventListener("keydown", handler);
    const removeEventListener = () => document.removeEventListener("keydown", handler);
    
    onBeforeUnmount(() => removeEventListener());
    onDeactivated(() => removeEventListener());

    if (condition && typeof condition !== "function") {
        watch(condition, (val) => (!val ? removeEventListener() : addEventListener()));
    }
}
