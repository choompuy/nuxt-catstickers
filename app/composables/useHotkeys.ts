import { KEY_TO_CODE } from "~/constants/keyToCode";

interface KeyDownOptions {
    condition?: Ref<boolean> | (() => boolean);
    target?: Ref<HTMLElement | Window | null> | HTMLElement | Window;
    modifiers?: {
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
        meta?: boolean;
    };
    preventDefault?: boolean;
    stopPropagation?: boolean;
    once?: boolean;
    passive?: boolean;
}

type CallbackFn = (event: KeyboardEvent) => void;

const normalizeKey = (key: string): string => {
    const lower = key.toLowerCase();
    return KEY_TO_CODE[lower] || lower;
};

export function useHotkeys(hotkeys: Record<string, CallbackFn>, options?: Omit<KeyDownOptions, "modifiers">) {
    const conditionRef = options?.condition ? (isRef(options.condition) ? options.condition : computed(options.condition)) : ref(true);
    const targetRef = options?.target ? (isRef(options.target) ? options.target : ref(options.target)) : ref(window);

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

    const cleanup = () => {
        const el = targetRef.value;
        if (el) el.removeEventListener("keydown", handler);
    };

    const setup = () => {
        cleanup();
        const el = targetRef.value;
        if (el && conditionRef.value) {
            el.addEventListener("keydown", handler, { passive: options?.passive ?? false });
        }
    };

    watch([targetRef, conditionRef], setup, { immediate: true });

    onBeforeUnmount(cleanup);
    onDeactivated(cleanup);

    return { cleanup };
}
