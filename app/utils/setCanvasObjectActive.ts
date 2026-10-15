import type { Canvas, FabricObject } from "fabric";

export function setCanvasActiveObject(canvas: Canvas, obj?: FabricObject) {
    canvas.discardActiveObject();

    if (obj) {
        obj.setCoords();
        canvas.setActiveObject(obj);
    }
}
