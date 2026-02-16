import { Canvas, FabricObject, Path, Rect, Ellipse, Point, type TPointerEvent } from "fabric";
import { OBJECT_BASE_PROPS, OBJECT_CLIP_PROPS, SELECT_MIN_AREA, SELECT_STROKE_COLOR } from "~/constants/canvas";
import type { CanvasClipMode } from "~/types/canvas";
import type { KeyModifiers } from "~/types/hotkeys";

interface DrawingState {
    isDrawing: boolean;
    preview: FabricObject | null;
    startPoint: Point | null;
    points: Point[];
}

const state: DrawingState = {
    isDrawing: false,
    preview: null,
    startPoint: null,
    points: [],
};

const resetState = () => {
    Object.assign(state, { isDrawing: false, preview: null, startPoint: null, points: [] });
};

const undo = (canvas: Canvas) => {
    if (state.preview) canvas.remove(state.preview);
    resetState();
    canvas.requestRenderAll();
};

const createPreview = (mode: CanvasClipMode, point: Point) => {
    const creators = {
        lasso: () => new Path(`M ${point.x} ${point.y}`, OBJECT_CLIP_PROPS),
        ellipse: () => new Ellipse({ ...OBJECT_CLIP_PROPS, left: point.x, top: point.y, rx: 0, ry: 0 }),
        rect: () => new Rect({ ...OBJECT_CLIP_PROPS, left: point.x, top: point.y, width: 0, height: 0 }),
    };
    return creators[mode]();
};

const createFinal = (mode: CanvasClipMode, data: any) => {
    const creators = {
        lasso: () => new Path(data, OBJECT_BASE_PROPS),
        ellipse: () => new Ellipse({ ...OBJECT_BASE_PROPS, ...data }),
        rect: () => new Rect({ ...OBJECT_BASE_PROPS, ...data }),
    };
    return creators[mode]();
};

const getBox = (start: Point, current: Point, keepRatio = false) => {
    let dx = current.x - start.x;
    let dy = current.y - start.y;

    if (keepRatio) {
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        dx = dx < 0 ? -size : size;
        dy = dy < 0 ? -size : size;
    }

    const left = Math.min(start.x, start.x + dx);
    const top = Math.min(start.y, start.y + dy);

    return {
        left,
        top,
        width: Math.abs(dx),
        height: Math.abs(dy),
    };
};

const calculateArea = {
    lasso: () => getPolygonArea(state.points),
    ellipse: () => {
        const e = state.preview as Ellipse;
        return Math.PI * (e.rx ?? 0) * (e.ry ?? 0);
    },
    rect: () => {
        const r = state.preview as Rect;
        return r.width * r.height;
    },
};

const down = (mode: CanvasClipMode) => (e: TPointerEvent, canvas: Canvas) => {
    state.isDrawing = true;
    const p = canvas.getScenePoint(e);
    state.startPoint = p;
    state.points = [p];
    state.preview = createPreview(mode, p);
    canvas.add(state.preview);
};

const move = (mode: CanvasClipMode) => (e: TPointerEvent, canvas: Canvas, modifiers: KeyModifiers) => {
    if (!state.isDrawing || !state.preview || !state.startPoint) return;

    if (mode === "lasso") {
        const p = canvas.getScenePoint(e);
        state.points.push(p);
        const path = state.points.map((pt, i) => (i === 0 ? ["M", pt.x, pt.y] : ["L", pt.x, pt.y]));
        (state.preview as Path).set({ path });
    } else {
        const box = getBox(state.startPoint, canvas.getScenePoint(e), modifiers.shift);

        if (mode === "ellipse") {
            (state.preview as Ellipse).set({
                left: box.left,
                top: box.top,
                rx: box.width / 2,
                ry: box.height / 2,
            });
        } else {
            (state.preview as Rect).set(box);
        }
    }

    canvas.requestRenderAll();
};

const up = (mode: CanvasClipMode) => (canvas: Canvas) => {
    if (!state.isDrawing || !state.preview) return null;
    state.isDrawing = false;

    if (calculateArea[mode]() < SELECT_MIN_AREA) return undo(canvas);

    let payload;

    if (mode === "lasso") {
        const closed = [...state.points, state.points[0]];
        payload = closed.map((p, i) => (p ? (i === 0 ? ["M", p.x, p.y] : ["L", p.x, p.y]) : undefined));
    } else if (mode === "ellipse") {
        const e = state.preview as Ellipse;
        payload = { left: e.left, top: e.top, rx: e.rx, ry: e.ry };
    } else {
        const r = state.preview as Rect;
        payload = { left: r.left, top: r.top, width: r.width, height: r.height };
    }

    const finalObject = createFinal(mode, payload);
    canvas.remove(state.preview);
    resetState();
    canvas.requestRenderAll();

    return finalObject;
};

export const createTool = (mode: CanvasClipMode) => ({
    undo,
    down: down(mode),
    move: move(mode),
    up: up(mode),
});

export const canvasLasso = createTool("lasso");
export const canvasRect = createTool("rect");
export const canvasEllipse = createTool("ellipse");
