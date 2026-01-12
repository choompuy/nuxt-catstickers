import { Canvas, Path, Shadow } from "fabric";

const strokeColor = "rgba(231, 37, 37, 1)";
const borderColor = "rgba(255, 255, 255, .6)";
const cornerColor = "rgba(255, 255, 255, 1)";

let drawing = false;
let points: { x: number; y: number }[] = [];
let path: Path | null = null;

export const canvasLasso = {
    invertColor([r, g, b]: [number, number, number]) {
        return `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
    },

    cancel(canvas: Canvas) {
        drawing = false;
        if (path) {
            canvas.remove(path);
            path = null;
        }
        canvas.requestRenderAll();
        return null;
    },

    onMouseDown(e: any, canvas: Canvas) {
        drawing = true;

        const p = canvas.getScenePoint(e);
        points = [p];

        path = new Path(`M ${p.x} ${p.y}`, {
            absolutePositioned: true,
            objectCaching: false,
            selectable: false,
            evented: false,
            fill: "",
            stroke: strokeColor,
            strokeWidth: 2,
            strokeUniform: true,
        });

        canvas.add(path);
    },

    onMouseMove(e: any, canvas: Canvas) {
        if (!drawing || !path) return;

        const p = canvas.getScenePoint(e);
        points.push(p);

        const d = points.map((p, i) => {
            if (i === 0) return ["M", p.x, p.y];
            return ["L", p.x, p.y];
        });

        path.set({ path: d });
        canvas.requestRenderAll();
    },

    onMouseUp(canvas: Canvas) {
        if (!drawing || !path) return null;
        drawing = false;

        if (points.length < 3) {
            canvas.remove(path);
            path = null;
            canvas.requestRenderAll();
            return null;
        }

        const closed = [...points, points[0]];
        const d = closed.map((p, i) => {
            if (p) {
                if (i === 0) return ["M", p.x, p.y];
                return ["L", p.x, p.y];
            }
        });

        const polygon = new Path(d as any, {
            absolutePositioned: true,
            objectCaching: false,
            selectable: true,
            evented: true,
            fill: "rgba(255, 255, 255, 0.01)",
            hoverCursor: "move",
            hasControls: true,
            hasBorders: true,
            borderColor: borderColor,
            borderScaleFactor: 1.5,
            borderOpacityWhenMoving: 0.6,
            cornerColor: cornerColor,
            cornerSize: 8,
            transparentCorners: false,
        });

        canvas.remove(path);
        path = null;
        canvas.add(polygon);
        canvas.setActiveObject(polygon);
        canvas.requestRenderAll();

        return polygon;
    },
};
