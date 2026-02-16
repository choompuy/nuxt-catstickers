import { KEY_TO_CODE } from "~/constants/keyToCode";
import type { CallbackFn, KeyDownOptions } from "~/types/hotkeys";

const normalizeKey = (key: string): string => {
    const lower = key.toLowerCase();
    return KEY_TO_CODE[lower] || lower;
};

export function useHotkeys(hotkeys: Record<string, CallbackFn>, options?: Omit<KeyDownOptions, "modifiers">) {
    const conditionRef = options?.condition ? (isRef(options.condition) ? options.condition : computed(options.condition)) : ref(true);
    const targetRef = options?.target ? (isRef(options.target) ? options.target : ref(options.target)) : ref(window);

    const shiftKey = ref(false);
    const ctrlKey = ref(false);
    const altKey = ref(false);
    const metaKey = ref(false);

    const updateModifiers = (event: KeyboardEvent) => {
        shiftKey.value = event.shiftKey;
        ctrlKey.value = event.ctrlKey || event.metaKey;
        altKey.value = event.altKey;
        metaKey.value = event.metaKey;
    };

    const parseHotkey = (hotkey: string) => {
        const parts = hotkey
            .toLowerCase()
            .split("+")
            .map((p) => p.trim());
        const key = parts.pop()!;

        return {
            code: normalizeKey(key),
            ctrl: parts.includes("ctrl") || parts.includes("control"),
            shift: parts.includes("shift"),
            alt: parts.includes("alt"),
            meta: parts.includes("meta") || parts.includes("cmd"),
        };
    };

    const parsedHotkeys = Object.entries(hotkeys).map(([hotkey, callback]) => ({
        ...parseHotkey(hotkey),
        callback,
        original: hotkey,
    }));

    const handler = (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        updateModifiers(keyboardEvent);

        if (!conditionRef.value) return;

        for (const hotkey of parsedHotkeys) {
            if (
                keyboardEvent.code === hotkey.code &&
                keyboardEvent.ctrlKey === hotkey.ctrl &&
                keyboardEvent.shiftKey === hotkey.shift &&
                keyboardEvent.altKey === hotkey.alt &&
                keyboardEvent.metaKey === hotkey.meta
            ) {
                if (options?.preventDefault) keyboardEvent.preventDefault();
                if (options?.stopPropagation) keyboardEvent.stopPropagation();

                hotkey.callback(keyboardEvent);
                break;
            }
        }
    };

    const keyupHandler = (event: Event) => {
        updateModifiers(event as KeyboardEvent);
    };

    const cleanup = () => {
        const el = targetRef.value;
        if (el) {
            el.removeEventListener("keydown", handler);
            el.removeEventListener("keyup", keyupHandler);
        }
    };

    const setup = () => {
        cleanup();
        const el = targetRef.value;
        if (el && conditionRef.value) {
            el.addEventListener("keydown", handler, { passive: options?.passive ?? false });
            el.addEventListener("keyup", keyupHandler, { passive: true });
        }
    };

    watch([targetRef, conditionRef], setup, { immediate: true });

    onBeforeUnmount(cleanup);
    onDeactivated(cleanup);

    return {
        cleanup,
        modifiers: {
            shift: readonly(shiftKey),
            ctrl: readonly(ctrlKey),
            alt: readonly(altKey),
            meta: readonly(metaKey),
        },
    };
}
