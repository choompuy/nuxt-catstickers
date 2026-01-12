import type { Canvas, TPointerEvent, TPointerEventInfo } from "fabric";

export type CanvasModes = "panZoom" | "lasso" | "select";
export type CanvasButton = 0 | 1 | 2;

export interface CanvasHistoryEntry {
    undo: () => void;
    redo: () => void;
}

export type CanvasEvent = TPointerEventInfo<TPointerEvent>;

export interface BaseHandler {
    down: (event: CanvasEvent, c: Canvas) => void;
    move: (event: CanvasEvent, c: Canvas) => void;
    up: (c: Canvas) => void;
    wheel?: (event: CanvasEvent, c: Canvas) => void;
    undo?: (c: Canvas) => void;
    redo?: (c: Canvas) => void;
}

export type HandlersMap = Record<CanvasModes, BaseHandler>;
