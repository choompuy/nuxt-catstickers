import { Canvas, Textbox } from "fabric";
import { OBJECT_BASE_PROPS } from "~/constants/canvas";
import type { CanvasEvent } from "~/types/canvas";

interface TextState {
    isEditing: boolean;
    text: Textbox | null;
}

const INITIAL_STATE: TextState = {
    isEditing: false,
    text: null,
};

const state = { ...INITIAL_STATE };

function onScale(e: unknown) {
    const obj = state.text;
    console.log(e);
    if (!obj || !("transform" in (e as { transform: Record<string, unknown> })) || Object.keys((e as { transform: Record<string, unknown> }).transform).length <= 0) return;
    const t = (e as { transform: Record<string, unknown> }).transform;

    const originX = t.originX;
    const originY = t.originY;

    const pointerX = t.ex;
    const pointerY = t.ey;

    // const baseLeft = t.original.left;
    // const baseTop = t.original.top;

    let width = obj.width;
    let height = obj.height;

    if (originX === "left") {
        width = pointerX;
    }

    if (originY === "top") {
        height = pointerY;
    }

    width = Math.max(20, width);
    height = Math.max(20, height);

    obj.set({
        width,
        height,
        scaleX: 1,
        scaleY: 1,
    });

    obj.setCoords();
}

function attachTextTransforms(obj: Textbox) {
    obj.on("scaling", onScale);
    obj.on("modified", () => {
        // isScaling = false; // unused
    });
}

function detachTextTransforms(obj: Textbox) {
    obj.off("scaling", onScale);
}

export const canvasText = {
    down(event: CanvasEvent, canvas: Canvas, onCommit?: (text: Textbox | null) => void) {
        const p = event.scenePoint;

        state.isEditing = true;

        const text = new Textbox("", {
            ...OBJECT_BASE_PROPS,
            left: p.x,
            top: p.y,
            fill: "#ffffff",
            fontSize: 16,
            editable: true,
            lockSkewingX: true,
            lockSkewingY: true,
        });

        state.text = text;

        attachTextTransforms(text);

        text.enterEditing();
        text.selectAll();

        const handleExit = () => {
            if (!text) return;

            const value = text.text?.trim();

            text.off("editing:exited", handleExit);

            if (value) {
                onCommit?.(text);
                return;
            }

            onCommit?.(null);
            this.undo(canvas);
        };

        text.on("editing:exited", handleExit);

        return text;
    },

    undo(canvas: Canvas) {
        if (state.text) {
            detachTextTransforms(state.text);
            canvas.remove(state.text);
        }

        Object.assign(state, INITIAL_STATE);
        canvas.requestRenderAll();
    },
};
