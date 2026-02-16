import type { FabricObject } from "fabric";
import type { CanvasHistoryEntry, CanvasHistoryMetadata, CanvasModes, CanvasState } from "~/types/canvas";

interface CanvasHistoryOptions {
    state: CanvasState;
    maxSize?: number;
    switchMode: (mode: CanvasModes) => void;
}

export function useCanvasHistory(options: CanvasHistoryOptions) {
    const { state, maxSize = 200, switchMode } = options;

    const entries = shallowRef<CanvasHistoryEntry[]>([]);
    const currentIndex = ref(-1);

    const canUndo = computed(() => currentIndex.value > 0);
    const canRedo = computed(() => currentIndex.value < entries.value.length - 1);

    const init = () => {
        entries.value = [
            {
                type: "default",
                metadata: {
                    label: "Project initialized",
                    timestamp: Date.now(),
                },
            },
        ];
        currentIndex.value = 0;
    };

    const push = (entry: CanvasHistoryEntry, meta?: Partial<CanvasHistoryMetadata>) => {
        const newEntries = entries.value.slice(0, currentIndex.value + 1);

        newEntries.push({
            ...entry,
            metadata: {
                timestamp: Date.now(),
                ...meta,
            },
        });

        if (newEntries.length > maxSize) {
            newEntries.shift();
        } else {
            currentIndex.value++;
        }

        entries.value = newEntries;
    };

    const saveState = (obj: FabricObject) => ({
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        angle: obj.angle,
    });

    const restoreState = (obj: FabricObject, objState: any) => {
        obj.set(objState);
        obj.setCoords();
    };

    const executeUndo = (entry: CanvasHistoryEntry) => {
        if (!state.canvas) return;

        switch (entry.type) {
            case "transform":
                if (entry.object && entry.before) {
                    restoreState(entry.object, entry.before);
                    state.canvas.requestRenderAll();
                }
                break;
            case "add":
                if (entry.object) state.canvas.remove(entry.object);
                break;
            case "remove":
                if (entry.object) state.canvas.add(entry.object);
                break;
            case "replace":
                if (entry.oldObject && entry.newObject) {
                    const idx = state.canvas.getObjects().indexOf(entry.newObject);
                    if (idx !== -1) {
                        state.canvas.remove(entry.newObject);
                        state.canvas.insertAt(idx, entry.oldObject);
                    }
                }
                break;
            default:
                if (entry.before) entry.before();
        }

        state.canvas.requestRenderAll();
    };

    const executeRedo = (entry: CanvasHistoryEntry) => {
        if (!state.canvas) return;

        switch (entry.type) {
            case "transform":
                if (entry.object && entry.after) {
                    restoreState(entry.object, entry.after);
                }
                break;
            case "add":
                if (entry.object) state.canvas.add(entry.object);
                break;
            case "remove":
                if (entry.object) state.canvas.remove(entry.object);
                break;
            case "replace":
                if (entry.oldObject && entry.newObject) {
                    const idx = state.canvas.getObjects().indexOf(entry.oldObject);
                    if (idx !== -1) {
                        state.canvas.remove(entry.oldObject);
                        state.canvas.insertAt(idx, entry.newObject);
                    }
                }
                break;
            default:
                if (entry.after) entry.after();
        }

        state.canvas.requestRenderAll();
    };

    const undo = () => {
        if (!canUndo.value) return;

        const entry = entries.value[currentIndex.value];
        if (!entry) return;

        executeUndo(entry);
        currentIndex.value--;

        const currentEntry = entries.value[currentIndex.value];
        if (currentEntry?.metadata?.mode) switchMode(currentEntry.metadata.mode);
    };

    const redo = () => {
        if (!canRedo.value) return;

        currentIndex.value++;
        const entry = entries.value[currentIndex.value];
        if (!entry) return;

        executeRedo(entry);
        if (entry.metadata?.mode) switchMode(entry.metadata.mode);
    };

    const goTo = (targetIndex: number) => {
        if (!state.canvas) return;
        if (targetIndex < -1 || targetIndex >= entries.value.length) return;
        if (targetIndex === currentIndex.value) return;

        const isMovingForward = targetIndex > currentIndex.value;

        if (isMovingForward) {
            for (let i = currentIndex.value + 1; i <= targetIndex; i++) {
                const entry = entries.value[i];
                if (entry) executeRedo(entry);
            }
        } else {
            for (let i = currentIndex.value; i > targetIndex; i--) {
                const entry = entries.value[i];
                if (entry) executeUndo(entry);
            }
        }

        currentIndex.value = targetIndex;
        const entry = entries.value[targetIndex];
        if (entry && entry.metadata?.mode) switchMode(entry.metadata.mode);

        state.canvas.requestRenderAll();
    };

    const clear = () => {
        entries.value = [];
        currentIndex.value = -1;
    };

    return {
        init,
        push,
        saveState,
        restoreState,
        undo,
        redo,
        goTo,
        clear,
        exposed: {
            entries: readonly(entries),
            index: readonly(currentIndex),
            canUndo,
            canRedo,
        },
    };
}
