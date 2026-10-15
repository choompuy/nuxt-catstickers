import type { CanvasHistoryEntry, CanvasHistoryListEntry, CanvasModes } from "~/types/canvas";

interface CanvasHistoryOptions {
    maxSize?: number;
    onChange?: () => void;
}

export function useCanvasHistory(options: CanvasHistoryOptions = {}) {
    const { maxSize = 200, onChange } = options;

    const entries = shallowRef<CanvasHistoryEntry[]>([]);
    const index = ref(-1);

    const canUndo = computed(() => index.value > 0);
    const canRedo = computed(() => index.value < entries.value.length - 1);

    const list = computed<CanvasHistoryListEntry[]>(() =>
        entries.value
            .map((e, i) => ({
                ...e,
                index: i,
                isActive: i === index.value,
                isFuture: i > index.value,
            }))
            .reverse()
    );

    const init = () => {
        command({
            label: "Project initialized",
            undo: () => {},
            redo: () => {},
        });
        index.value = 0;
    };

    function execute(entry: CanvasHistoryEntry) {
        const next = entries.value.slice(0, index.value + 1);

        next.push(entry);

        if (next.length > maxSize) {
            next.shift();
        } else {
            index.value++;
        }

        entries.value = next;

        entry.redo();
        onChange?.();
    }

    function command(options: {
        undo: () => void;
        redo: () => void;
        label?: string;
        mode?: CanvasModes;
    }) {
        execute({
            timestamp: Date.now(),
            ...options,
        });
    }

    function update<T>(
        apply: (state: T) => void,
        from: T,
        to: T,
        meta?: { label?: string; mode?: CanvasModes }
    ) {
        command({
            ...meta,
            undo: () => apply(from),
            redo: () => apply(to),
        });
    }

    const undo = () => {
        if (!canUndo.value) return;

        const entry = entries.value[index.value];
        if (!entry) return;

        entry.undo();
        onChange?.();

        index.value--;
    };

    const redo = () => {
        if (!canRedo.value) return;

        index.value++;

        const entry = entries.value[index.value];
        if (!entry) return;

        entry.redo();
        onChange?.();
    };

    function goTo(target: number) {
        if (target === index.value) return;

        while (index.value < target) redo();
        while (index.value > target) undo();
    }

    const clear = () => {
        entries.value = [];
        index.value = -1;
    };

    return {
        init,
        command,
        update,
        undo,
        redo,
        goTo,
        clear,
        exposed: {
            list: shallowReadonly(list),
            canUndo,
            canRedo,
        },
    };
}
