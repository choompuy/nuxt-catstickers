import type {
    Textbox,
    Canvas,
    FabricImage,
    FabricObject,
    TPointerEvent,
    TPointerEventInfo,
} from "fabric";

export type CanvasClipMode = "lasso" | "rect" | "ellipse";
export type CanvasModes = CanvasClipMode | "move" | "panZoom" | "text";

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

export type CanvasHandlerMap = Record<CanvasModes, CanvasHandler>;

type CanvasLayerTypeMap = {
    textbox: Textbox;
    image: FabricImage;
    rect: FabricObject;
    ellipse: FabricObject;
    path: FabricObject;
};

export type CanvasLayerEntry = {
    [K in keyof CanvasLayerTypeMap]: {
        id: string;
        label: string;
        visible?: boolean;
        type: K;
        object: CanvasLayerTypeMap[K];
    };
}[keyof CanvasLayerTypeMap];

export type CanvasLayerType = CanvasLayerEntry["type"];

export interface CanvasHistoryEntry {
    undo(): void;
    redo(): void;
    label?: string;
    mode?: CanvasModes;
    timestamp: number;
}

export type CanvasHistoryListEntry = CanvasHistoryEntry & {
    index: number;
    isActive: boolean;
    isFuture: boolean;
};
