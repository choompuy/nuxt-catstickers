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

export const CURSOR = {
    default: "default",
    move: "move",
    grab: "grab",
    grabbing: "grabbing",
    crosshair: "crosshair",
    text: "text",
};

export const CURSOR_MAP: Record<CanvasModes, { default: string; hover: string }> = {
    move: { default: CURSOR.default, hover: CURSOR.default },
    panZoom: { default: CURSOR.grab, hover: CURSOR.grab },
    lasso: { default: CURSOR.crosshair, hover: CURSOR.crosshair },
    rect: { default: CURSOR.crosshair, hover: CURSOR.crosshair },
    ellipse: { default: CURSOR.crosshair, hover: CURSOR.crosshair },
    text: { default: CURSOR.text, hover: CURSOR.text },
};

export const CLIP_MODES: CanvasModes[] = ["lasso", "rect", "ellipse"];
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
    hasControls: true,
    hasBorders: true,
    borderColor: SELECT_BORDER_COLOR,
    borderScaleFactor: 1.5,
    borderOpacityWhenMoving: 0.6,
    cornerColor: SELECT_CORNER_COLOR,
    cornerStrokeColor: SELECT_CORNER_COLOR,
    cornerSize: 8,
    transparentCorners: false,
};
