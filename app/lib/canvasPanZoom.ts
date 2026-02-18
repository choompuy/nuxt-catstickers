import { Canvas, FabricImage, Point } from "fabric";
import { CURSOR } from "~/constants/canvas";
import type { CanvasEvent, CanvasEventWheel } from "~/types/canvas";

const PADDING = 80;
let isPanning = false;
let lastPos = new Point(0, 0);
let pinchStartDist = 0;
let pinchStartZoom = 1;
let lastTouchCount = 0;

function clampViewport(canvas: Canvas, image: FabricImage) {
    const zoom = canvas.getZoom();

    const minX = -(image.width * zoom) + PADDING;
    const minY = -(image.height * zoom) + PADDING;

    const maxX = canvas.getWidth() - PADDING;
    const maxY = canvas.getHeight() - PADDING;

    const vpt = canvas.viewportTransform;
    let x = vpt[4];
    let y = vpt[5];

    x = Math.min(maxX, Math.max(minX, x));
    y = Math.min(maxY, Math.max(minY, y));

    vpt[4] = x;
    vpt[5] = y;

    canvas.setViewportTransform(vpt);
}

export const canvasPanZoom = {
    down(event: CanvasEvent, canvas: Canvas) {
        isPanning = true;
        canvas.setCursor(CURSOR.grabbing);
        lastPos = event.viewportPoint;
    },

    mouseMove(event: CanvasEvent, canvas: Canvas, img: FabricImage | null) {
        if (!isPanning) return;

        canvas.setCursor(CURSOR.grabbing);
        const p = event.viewportPoint;
        canvas.relativePan(new Point(p.x - lastPos.x, p.y - lastPos.y));
        lastPos = p;

        if (img) clampViewport(canvas, img);
        canvas.requestRenderAll();
    },

    touchMove(event: CanvasEvent, canvas: Canvas, img: FabricImage | null) {
        const e = event.e;
        if (!(e instanceof TouchEvent)) return;

        const touchCount = e.touches.length;

        if (touchCount !== lastTouchCount) {
            pinchStartDist = 0;
            pinchStartZoom = canvas.getZoom();
            lastPos = event.viewportPoint;
        }

        lastTouchCount = touchCount;

        if (touchCount === 1 && e.touches[0]) {
            const p = event.viewportPoint;

            if (lastPos) canvas.relativePan(new Point(p.x - lastPos.x, p.y - lastPos.y));
            lastPos = p;
        } else if (touchCount === 2 && e.touches[0] && e.touches[1]) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];

            const dist = getTouchDistance(t1, t2);
            const center = getTouchCenter(t1, t2);

            if (pinchStartDist === 0) {
                pinchStartDist = dist;
                pinchStartZoom = canvas.getZoom();
                lastPos = center;
                return;
            }

            const zoom = pinchStartZoom * (dist / pinchStartDist);
            canvas.zoomToPoint(center, zoom);

            if (lastPos) canvas.relativePan(new Point(center.x - lastPos.x, center.y - lastPos.y));
            lastPos = center;
        }

        if (img) clampViewport(canvas, img);
        canvas.requestRenderAll();
    },

    up(canvas: Canvas) {
        pinchStartDist = 0;
        isPanning = false;
        lastTouchCount = 0;

        canvas.requestRenderAll();
    },

    wheelZoom(event: CanvasEvent, canvas: Canvas, img: FabricImage | null) {
        const e = event.e;
        e.preventDefault();

        if (e instanceof WheelEvent) {
            const delta = e.deltaY;
            const zoom = canvas.getZoom();
            const p = event.viewportPoint;

            let newZoom = zoom * (delta > 0 ? 0.95 : 1.05);
            canvas.zoomToPoint(p, Math.max(0.01, Math.min(5, newZoom)));
        }

        if (img) clampViewport(canvas, img);
        canvas.requestRenderAll();
    },

    wheel(event: CanvasEventWheel, canvas: Canvas, isVertical = true) {
        const e = event.e;
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY;
        const vpt = canvas.viewportTransform;

        if (isVertical) {
            vpt[5] -= delta * 0.5;
        } else {
            vpt[4] -= delta * 0.5;
        }

        canvas.setViewportTransform(vpt);
        canvas.requestRenderAll();
    },
};
