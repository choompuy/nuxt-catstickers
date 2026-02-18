import { Canvas, FabricObject, Path, Rect, Ellipse, Point } from "fabric";
import { OBJECT_BASE_PROPS, OBJECT_CLIP_PROPS, SELECT_MIN_AREA } from "~/constants/canvas";
import type { CanvasClipMode, CanvasEvent } from "~/types/canvas";
import type { KeyModifiers } from "~/types/hotkeys";

interface DrawingState {
    isDrawing: boolean;
    mode: CanvasClipMode | null;
    preview: FabricObject | null;
    startPoint: Point | null;
    points: Point[];
}

type ClipObject = Path | Rect | Ellipse;

const INITIAL_STATE: DrawingState = {
    isDrawing: false,
    mode: null,
    preview: null,
    startPoint: null,
    points: [],
};

const state = { ...INITIAL_STATE };

const PREVIEW_CREATORS: Record<CanvasClipMode, (point: Point) => ClipObject> = {
    lasso: (point) => new Path(`M ${point.x} ${point.y}`, OBJECT_CLIP_PROPS),
    rect: (point) => new Rect({ ...OBJECT_CLIP_PROPS, left: point.x, top: point.y, width: 0, height: 0 }),
    ellipse: (point) => new Ellipse({ ...OBJECT_CLIP_PROPS, left: point.x, top: point.y, rx: 0, ry: 0 }),
};

const FINAL_CREATORS: Record<CanvasClipMode, (payload: any) => ClipObject> = {
    lasso: (payload) => new Path(payload as any, OBJECT_BASE_PROPS),
    rect: (payload) => new Rect({ ...OBJECT_BASE_PROPS, ...payload }),
    ellipse: (payload) => new Ellipse({ ...OBJECT_BASE_PROPS, ...payload }),
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

    return { left, top, width: Math.abs(dx), height: Math.abs(dy) };
};

const calculateArea: Record<CanvasClipMode, () => number> = {
    lasso: () => getPolygonArea(state.points),
    rect: () => {
        const r = state.preview as Rect;
        return r.width * r.height;
    },
    ellipse: () => {
        const e = state.preview as Ellipse;
        return Math.PI * (e.rx ?? 0) * (e.ry ?? 0);
    },
};

const payloads: Record<CanvasClipMode, () => any> = {
    lasso: () => {
        const closed = [...state.points, state.points[0]];
        return closed.map((p, i) => (i === 0 ? ["M", p!.x, p!.y] : ["L", p!.x, p!.y]));
    },
    rect: () => {
        const r = state.preview as Rect;
        return { left: r.left, top: r.top, width: r.width, height: r.height };
    },
    ellipse: () => {
        const e = state.preview as Ellipse;
        return { left: e.left, top: e.top, rx: e.rx, ry: e.ry };
    },
};

const resetState = () => {
    Object.assign(state, INITIAL_STATE);
};

const undo = (canvas: Canvas) => {
    if (state.preview) canvas.remove(state.preview);
    resetState();
    canvas.requestRenderAll();
};

const down = (mode: CanvasClipMode) => (event: CanvasEvent, canvas: Canvas) => {
    if (state.preview) {
        if (state.mode === mode) {
            up(mode);
            return;
        }

        undo(canvas);
    }

    state.isDrawing = true;
    state.mode = mode;

    const point = event.scenePoint;
    state.startPoint = point;
    state.points = [point];
    state.preview = PREVIEW_CREATORS[mode](point);

    canvas.add(state.preview);
};

const move = (mode: CanvasClipMode) => (event: CanvasEvent, canvas: Canvas, modifiers: KeyModifiers) => {
    if (!state.isDrawing || !state.preview || !state.startPoint) return;

    if (mode === "lasso") {
        state.points.push(event.scenePoint);
        const path = state.points.map((pt, i) => (i === 0 ? ["M", pt.x, pt.y] : ["L", pt.x, pt.y]));
        (state.preview as Path).set({ path });
    } else {
        const box = getBox(state.startPoint, event.scenePoint, modifiers.shift);

        if (mode === "rect") {
            (state.preview as Rect).set(box);
        } else {
            (state.preview as Ellipse).set({ left: box.left, top: box.top, rx: box.width / 2, ry: box.height / 2 });
        }
    }

    canvas.requestRenderAll();
};

const up = (mode: CanvasClipMode) => (canvas: Canvas) => {
    if (!state.isDrawing || !state.preview) return null;

    state.isDrawing = false;

    if (calculateArea[mode]() < SELECT_MIN_AREA) {
        undo(canvas);
        return null;
    }

    const payload = payloads[mode]();
    const finalObject = FINAL_CREATORS[mode](payload);

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
