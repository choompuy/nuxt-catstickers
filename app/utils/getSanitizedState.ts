import type { FabricObject } from "fabric";
import type { CanvasObjectTypes, CanvasObjectState, ObjectBaseState } from "~/types/canvasObject";

export function getSanitizedState(obj: FabricObject): CanvasObjectState {
    const raw = obj.toObject(["ID"]);

    const base: ObjectBaseState = {
        ID: raw.ID,
        left: raw.left,
        top: raw.top,
        width: raw.width,
        height: raw.height,
        scaleX: raw.scaleX,
        scaleY: raw.scaleY,
        angle: raw.angle,
        skewX: raw.skewX,
        skewY: raw.skewY,
        flipX: raw.flipX,
        flipY: raw.flipY,
        opacity: raw.opacity,
        visible: raw.visible,
        fill: raw.fill ?? null,
        backgroundColor: raw.backgroundColor ?? null,
        stroke: raw.stroke ?? null,
        strokeWidth: raw.strokeWidth,
        strokeDashOffset: raw.strokeDashOffset ?? null,
        shadow: raw.shadow ?? null,
    };

    const type = (raw.type as string).toLowerCase() as CanvasObjectTypes;

    switch (type) {
        case "image":
            return {
                ...base,
                src: raw.src,
                cropX: raw.cropX,
                cropY: raw.cropY,
            };

        case "path":
            return {
                ...base,
                path: raw.path,
            };

        case "rect":
            return {
                ...base,
                rx: raw.rx,
                ry: raw.ry,
            };

        case "ellipse":
            return {
                ...base,
                rx: raw.rx,
                ry: raw.ry,
            };

        case "textbox":
            return {
                ...base,
                text: raw.text,
                fontSize: raw.fontSize,
                fontWeight: raw.fontWeight,
                fontFamily: raw.fontFamily,
                fontStyle: raw.fontStyle,
                textAlign: raw.textAlign,
                lineHeight: raw.lineHeight,
                charSpacing: raw.charSpacing,
            };

        default:
            return base;
    }
}
