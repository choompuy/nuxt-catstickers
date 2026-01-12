import type { CanvasHistoryEntry } from "~/types/canvas";

export const canvasImage = {
    pushHistory(history: CanvasHistoryEntry[], entry: CanvasHistoryEntry, index: number) {
        history.splice(index + 1);

        history.push(entry);
        index = history.length - 1;
    },

    undo(history: CanvasHistoryEntry[], index: number) {
        if (index < 0) return;
        history?.[index]?.undo();
        index--;
    },

    redo(history: CanvasHistoryEntry[], index: number) {
        if (index >= history.length - 1) return;
        index++;
        history?.[index]?.redo();
    },
};
