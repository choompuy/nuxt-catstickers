import type { CanvasButton, CanvasEvent, CanvasInput } from "~/types/canvas";

export function getCanvasInput(event: CanvasEvent): CanvasInput {
    const e = event.e;
    
    if (e instanceof TouchEvent) {
        const count = Math.min(e.touches.length - 1, 1); // 0: one finger, 1: two fingers, 2: three or more
        return { device: "touch", button: count as CanvasButton };
    }

    if ((e instanceof PointerEvent && e.pointerType === "mouse") || e instanceof MouseEvent) {
        return { device: "mouse", button: e.button as CanvasButton };
    }

    return { device: "mouse", button: 0 };
}
