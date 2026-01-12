import { Canvas, FabricImage, Point } from "fabric";

const PADDING = 80;
let isPanning = false;
let lastPos = new Point(0, 0);

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
    onMouseDown(e: any, canvas: Canvas) {
        isPanning = true;
        canvas.setCursor("grabbing");
        lastPos = canvas.getViewportPoint(e);
    },

    onMouseMove(e: any, canvas: Canvas, img: FabricImage | null) {
        if (!isPanning) return;

        canvas.setCursor("grabbing");
        const p = canvas.getViewportPoint(e);
        const dx = p.x - lastPos.x;
        const dy = p.y - lastPos.y;

        canvas.relativePan(new Point(dx, dy));
        lastPos = p;

        if (img) clampViewport(canvas, img);
        canvas.requestRenderAll();
    },

    onMouseUp(canvas: Canvas) {
        isPanning = false;
        canvas.requestRenderAll();
    },

    onMouseWheel(e: any, canvas: Canvas, img: FabricImage | null) {
        e.preventDefault();

        const delta = e.deltaY;
        const zoom = canvas.getZoom();
        const p = canvas.getViewportPoint(e);

        let newZoom = zoom * (delta > 0 ? 0.95 : 1.05);
        canvas.zoomToPoint(p, Math.max(0.01, Math.min(10, newZoom)));

        if (img) clampViewport(canvas, img);
        canvas.requestRenderAll();
    },
};
