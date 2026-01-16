import type { Canvas, FabricImage, FabricObject, Path, TPointerEvent, TPointerEventInfo } from "fabric";
import type { ShallowRef } from "vue";

export type CanvasModes = "panZoom" | "lasso" | "select";
export type CanvasButton = 0 | 1 | 2;
export type CanvasInput = {
    device: "mouse" | "touch";
    button: CanvasButton;
};

export interface CanvasState {
    wrapperEl: HTMLElement | null;
    canvasEl: HTMLCanvasElement | null;
    canvas: Canvas | null;
    image: { original: FabricImage | null; active: FabricImage | null };
    isActive: boolean;
    entities: {
        lasso: ShallowRef<Path | null>;
        selection: ShallowRef<FabricObject | null>;
    };
    input: CanvasInput;
}

export type CanvasEvent = TPointerEventInfo<TPointerEvent>;

export interface CanvasHandler {
    down: (event: CanvasEvent, c: Canvas) => void;
    move: (event: CanvasEvent, c: Canvas) => void;
    up: (c: Canvas) => void;
    wheel?: (event: CanvasEvent, c: Canvas) => void;
    undo?: (c: Canvas) => void;
    redo?: (c: Canvas) => void;
}

export interface CanvasHistoryEntry {
    undo: () => void;
    redo: () => void;
}

export type HandlersMap = Record<CanvasModes, CanvasHandler>;
