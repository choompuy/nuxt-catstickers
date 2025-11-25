import type { PanZoomBaseOptions } from "~/types/panZoom";

export function usePanZoomBase(options: PanZoomBaseOptions = {}) {
    const { minScale = 0.01, maxScale = 5 } = options;

    const scale = ref(1);
    const isDragging = ref(false);
    const dragStart = ref({ x: 0, y: 0 });
    const offset = ref({ x: 0, y: 0 });

    function initialState() {
        scale.value = 1;
        isDragging.value = false;
        dragStart.value = { x: 0, y: 0 };
        offset.value = { x: 0, y: 0 };
    }

    function startDrag(e: MouseEvent) {
        isDragging.value = true;
        dragStart.value = {
            x: e.clientX - offset.value.x,
            y: e.clientY - offset.value.y,
        };
    }

    function drag(e: MouseEvent) {
        if (!isDragging.value) return;

        offset.value = {
            x: e.clientX - dragStart.value.x,
            y: e.clientY - dragStart.value.y,
        };
    }

    function endDrag() {
        isDragging.value = false;
    }

    function clampScale(newScale: number) {
        return Math.min(maxScale, Math.max(minScale, newScale));
    }

    function applyZoom(zoom: number, cx: number, cy: number) {
        const newScale = clampScale(scale.value + scale.value * zoom);

        const factor = newScale / scale.value - 1;

        offset.value.x -= cx * factor;
        offset.value.y -= cy * factor;

        scale.value = newScale;
    }

    return {
        scale,
        offset,
        isDragging,
        initialState,
        startDrag,
        drag,
        endDrag,
        clampScale,
        applyZoom,
    };
}
