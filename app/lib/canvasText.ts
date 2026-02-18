import { Canvas, Textbox } from "fabric";
import { OBJECT_BASE_PROPS } from "~/constants/canvas";
import type { CanvasEvent } from "~/types/canvas";

export const canvasText = {
    down(event: CanvasEvent, canvas: Canvas) {
        const p = event.scenePoint;

        const text = new Textbox("", {
            ...OBJECT_BASE_PROPS,
            left: p.x,
            top: p.y,
            fill: "#000",
            editable: true,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();

        text.enterEditing();
        text.selectAll();

        text.on("editing:exited", () => {
            const value = text.text?.trim();

            if (!value) {
                canvas.remove(text);
                canvas.requestRenderAll();
            }
        });

        return text;
    },
};
