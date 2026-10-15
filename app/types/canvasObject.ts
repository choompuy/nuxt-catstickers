import type { Shadow } from "fabric";

export type CanvasObjectTypes = "fabricobject" | "image" | "path" | "rect" | "ellipse" | "textbox";

export type ObjectBaseState = {
    ID: string;
    left: number;
    top: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    skewX: number;
    skewY: number;
    flipX: boolean;
    flipY: boolean;
    opacity: number;
    visible: boolean;
    fill: string | null;
    backgroundColor: string | null;
    stroke: string | null;
    strokeWidth: number;
    strokeDashOffset: number | null;
    shadow: Shadow | null;
};

export type ObjectImageState = ObjectBaseState & {
    src: string;
    cropX: number;
    cropY: number;
};

export type ObjectPathState = ObjectBaseState & {
    path: unknown[];
};

export type ObjectRectState = ObjectBaseState & {
    rx: number;
    ry: number;
};

export type ObjectEllipseState = ObjectBaseState & {
    rx: number;
    ry: number;
};

export type ObjectTextboxState = ObjectBaseState & {
    text: string;
    fontSize: number;
    fontWeight: string;
    fontFamily: string;
    fontStyle: string;
    textAlign: string;
    lineHeight: number;
    charSpacing: number;
};

export type CanvasObjectState =
    | ObjectBaseState
    | ObjectImageState
    | ObjectPathState
    | ObjectRectState
    | ObjectEllipseState
    | ObjectTextboxState;
export type CanvasObjectStateKeys =
    | keyof ObjectBaseState
    | keyof ObjectTextboxState
    | keyof ObjectImageState
    | keyof ObjectRectState
    | keyof ObjectEllipseState
    | keyof ObjectPathState;
