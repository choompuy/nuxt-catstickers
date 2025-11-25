import { usePanZoomBase } from "./usePanZoomBase";
import type { PanZoomBaseOptions } from "~/types/panZoom";

export function useImagePanZoom(options: { containerId: string } & PanZoomBaseOptions) {
    const base = usePanZoomBase(options);

    const elementRef = ref<HTMLImageElement | null>(null);
    const containerRect = ref<DOMRect | null>(null);
    let rafId: number | null = null;

    function init(el: HTMLImageElement) {
        elementRef.value = el;
        containerRect.value = document.getElementById(options.containerId)?.getBoundingClientRect() || null;
    }

    function updateTransform() {
        if (!elementRef.value) return;
        elementRef.value.style.transform = `translate(${base.offset.value.x}px, ${base.offset.value.y}px) ` + `scale(${base.scale.value})`;
    }

    function smoothUpdate() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateTransform);
    }

    function clampOffset() {
        if (base.isDragging.value) return;

        const container = containerRect.value;
        const el = elementRef.value;
        if (!container || !el) return;

        const scaledWidth = el.clientWidth * base.scale.value;
        const scaledHeight = el.clientHeight * base.scale.value;

        const maxX = Math.max((scaledWidth - container.width) / 2, 0);
        const maxY = Math.max((scaledHeight - container.height) / 2, 0);

        base.offset.value.x = Math.min(Math.max(base.offset.value.x, -maxX), maxX);
        base.offset.value.y = Math.min(Math.max(base.offset.value.y, -maxY), maxY);

        smoothUpdate();
    }

    function onWheel(e: WheelEvent) {
        if (!containerRect.value) return;

        const cx = e.clientX - containerRect.value.left - containerRect.value.width / 2;
        const cy = e.clientY - containerRect.value.top - containerRect.value.height / 2;

        const delta = e.deltaY < 0 ? 0.1 : -0.1;

        base.applyZoom(delta, cx, cy);

        clampOffset();
    }

    function onMouseDown(e: MouseEvent) {
        base.startDrag(e);

        if (elementRef.value) {
            elementRef.value.style.transition = "none";
        }
    }

    function onMouseMove(e: MouseEvent) {
        if (!base.isDragging.value) return;
        base.drag(e);

        smoothUpdate();
    }

    function onMouseUp() {
        base.endDrag();

        if (elementRef.value) {
            elementRef.value.style.transition = "";
        }

        clampOffset();
    }

    function reset() {
        base.initialState();
        smoothUpdate();
    }

    function close() {
        base.initialState();
    }

    onDeactivated(close);
    onBeforeUnmount(close);

    return {
        elementRef,
        scale: base.scale,
        offset: base.offset,
        init,
        onWheel,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        reset,
        close
    };
}
