import type { TFabricObjectProps } from "fabric";
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
    select: { default: "move", hover: "pointer" },
    lasso: { default: "crosshair", hover: "crosshair" },
    rect: { default: "crosshair", hover: "crosshair" },
    ellipse: { default: "crosshair", hover: "crosshair" },
};

export const INITIAL_STATE: CanvasState = {
    wrapperEl: null,
    canvasEl: null,
    canvas: null,
    image: { original: null, active: null },
    isActive: false,
    entities: {
        clip: shallowRef(null),
        selection: shallowRef(null),
    },
};

export const CLIP_MODES = ["lasso", "rect", "ellipse"];
export const UNDO_TRANSFORM = Symbol("undoTransform");

export const SELECT_STROKE_COLOR = "rgba(255, 255, 255, 1)";
export const SELECT_BORDER_COLOR = "rgba(255, 255, 255, .6)";
export const SELECT_CORNER_COLOR = "rgba(255, 255, 255, 1)";

export const SELECT_MIN_AREA = 300;

export const OBJECT_CLIP_PROPS: TFabricObjectProps = {
    absolutePositioned: true,
    objectCaching: false,
    selectable: false,
    evented: false,
    fill: null,
    stroke: SELECT_STROKE_COLOR,
    strokeWidth: 1,
    strokeUniform: true,
};

export const OBJECT_BASE_PROPS: TFabricObjectProps = {
    absolutePositioned: true,
    objectCaching: false,
    selectable: true,
    evented: true,
    fill: null,
    hoverCursor: "move",
    hasControls: true,
    hasBorders: true,
    borderColor: SELECT_BORDER_COLOR,
    borderScaleFactor: 1.5,
    borderOpacityWhenMoving: 0.6,
    cornerColor: SELECT_CORNER_COLOR,
    cornerSize: 8,
    transparentCorners: false,
};
