import type { Canvas, Ellipse, FabricImage, FabricObject, Path, Rect, TPointerEvent, TPointerEventInfo } from "fabric";
import type { ShallowRef } from "vue";

export type CanvasClipMode = "lasso" | "rect" | "ellipse";
export type CanvasModes = "panZoom" | "select" | CanvasClipMode;

export type CanvasInput = {
    device: "mouse" | "touch";
    button: 0 | 1 | 2;
};
export type CanvasButton = CanvasInput["button"];

export interface CanvasState {
    wrapperEl: HTMLElement | null;
    canvasEl: HTMLCanvasElement | null;
    canvas: Canvas | null;
    image: { original: FabricImage | null; active: FabricImage | null };
    isActive: boolean;
    entities: {
        clip: ShallowRef<Path | Rect | Ellipse | null>;
        selection: ShallowRef<FabricObject | null>;
    };
}

export type CanvasEvent = TPointerEventInfo<TPointerEvent>;
export type CanvasEventWheel = TPointerEventInfo<WheelEvent>;

export interface CanvasHandler {
    down: (event: CanvasEvent, c: Canvas) => void;
    move: (event: CanvasEvent, c: Canvas) => void;
    up: (c: Canvas) => void;
    wheel?: (event: CanvasEvent, c: Canvas) => void;
    undo?: (c: Canvas) => void;
    redo?: (c: Canvas) => void;
    apply?: (c: Canvas) => void;
}

export type HandlersMap = Record<CanvasModes, CanvasHandler>;

export interface CanvasHistoryEntry {
    type: "add" | "remove" | "transform" | "replace" | "default";
    object?: FabricObject;
    oldObject?: FabricObject;
    newObject?: FabricObject;
    before?: any;
    after?: any;
    metadata?: {
        timestamp: number;
        label?: string;
        mode?: CanvasModes;
    };
}

export type CanvasHistoryAction = CanvasHistoryEntry["type"];
export type CanvasHistoryMetadata = CanvasHistoryEntry["metadata"];
