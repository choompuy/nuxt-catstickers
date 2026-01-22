import type { CanvasModes, CanvasState } from "~/types/canvas";

export const CANVAS_CONFIG = {
    enableRetinaScaling: true,
    fireMiddleClick: true,
    fireRightClick: true,
    stopContextMenu: true,
    skipOffscreen: false,
    renderOnAddRemove: false,
    selection: false,
};

export const CURSOR_MAP: Record<CanvasModes, { default: string; hover: string }> = {
    panZoom: { default: "grab", hover: "grab" },
    lasso: { default: "crosshair", hover: "crosshair" },
    select: { default: "move", hover: "pointer" },
};

export const INITIAL_STATE: CanvasState = {
    wrapperEl: null,
    canvasEl: null,
    canvas: null,
    image: { original: null, active: null },
    isActive: false,
    entities: {
        lasso: shallowRef(null),
        selection: shallowRef(null),
    },
    input: {
        button: 0,
        device: "mouse",
    },
};
