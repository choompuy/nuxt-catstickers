import type { ShallowRef } from "vue";
import { Canvas, FabricImage, FabricObject, Path } from "fabric";
import type { CanvasButton, CanvasEvent, CanvasHistoryEntry, CanvasModes, HandlersMap } from "~/types/canvas";
import { canvasImage } from "~/lib/canvasImage";
import { canvasPanZoom } from "~/lib/canvasPanZoom";
import { canvasLasso } from "~/lib/canvasLasso";

const CANVAS_CONFIG = {
    enableRetinaScaling: true,
    fireMiddleClick: true,
    fireRightClick: true,
    stopContextMenu: true,
    skipOffscreen: false,
    renderOnAddRemove: false,
    selection: false,
} as const;

const CURSOR_MAP: Record<CanvasModes, { default: string; hover: string }> = {
    panZoom: { default: "grab", hover: "grab" },
    lasso: { default: "crosshair", hover: "crosshair" },
    select: { default: "move", hover: "pointer" },
};

interface CanvasState {
    wrapperEl: HTMLElement | null;
    canvasEl: HTMLCanvasElement | null;
    canvas: Canvas | null;
    image: {
        original: FabricImage | null;
        active: FabricImage | null;
    };
    isActive: boolean;
    historyIndex: number;
}

const INITIAL_STATE: CanvasState = {
    wrapperEl: null,
    canvasEl: null,
    canvas: null,
    image: { original: null, active: null },
    isActive: false,
    historyIndex: -1,
};

export function useCanvas() {
    const lassoPath = shallowRef<Path | null>(null);
    const currentMouseButton = ref<CanvasButton>(0);
    const currentMode = ref<CanvasModes>("panZoom");
    const history = shallowRef<CanvasHistoryEntry[]>([]);

    const state: CanvasState = INITIAL_STATE;

    const updateCursors = (mode: CanvasModes) => {
        if (!state.canvas) return;
        const cursors = CURSOR_MAP[mode] || { default: "default", hover: "default" };
        state.canvas.defaultCursor = cursors.default;
        state.canvas.hoverCursor = cursors.hover;
    };

    async function initCanvas(wrapperElement: HTMLElement, canvasElement: HTMLCanvasElement, imageUrl: string) {
        state.wrapperEl = wrapperElement;
        state.canvasEl = canvasElement;

        state.canvas = new Canvas(canvasElement, {
            ...CANVAS_CONFIG,
            width: wrapperElement.clientWidth,
            height: wrapperElement.clientHeight,
        });

        const img = await canvasImage.loadImage(imageUrl);
        const clone = await img.clone();

        img.selectable = false;
        clone.selectable = false;
        clone.opacity = 1;

        canvasImage.scaleToFitImage(state.canvas, img);
        canvasImage.scaleToFitImage(state.canvas, clone);

        state.canvas.add(img);
        state.canvas.add(clone);
        state.canvas.sendObjectToBack(clone);

        state.image = {
            original: clone,
            active: img,
        };

        switchMode(currentMode.value);
        setupEvents();
        handleResize();
    }

    function showOriginalImage(show: boolean) {
        if (!state.image.original) return;
        state.image.original.opacity = show ? 0.3 : 0;
    }

    function switchMode(mode: CanvasModes) {
        currentMode.value = mode;
        if (!state.canvas) return;

        if (mode === "lasso") {
            showOriginalImage(true);
            if (lassoPath.value) {
                state.canvas.setActiveObject(lassoPath.value);
            }
        } else if (lassoPath.value) {
            showOriginalImage(false);
            state.canvas.discardActiveObject();
        }

        state.canvas.skipTargetFind = mode === "panZoom";

        updateCursors(mode);
        state.canvas.requestRenderAll();
    }

    function addObject(obj: FabricObject) {
        if (!state.canvas) return;
        state.canvas.add(obj);
        state.canvas.setActiveObject(obj);
        state.canvas.requestRenderAll();
    }

    function replaceObject(oldObj: FabricObject, newObj: FabricObject) {
        if (!state.canvas) return;

        const objects = state.canvas.getObjects();
        const index = objects.indexOf(oldObj);

        if (index === -1) return;

        state.canvas.remove(oldObj);
        state.canvas.insertAt(index, newObj);
        state.canvas.requestRenderAll();
    }

    function attachObjectListeners(obj: Path, ref: ShallowRef<Path | null>) {
        ref.value = obj;

        let initialLeft = obj.left;
        let initialTop = obj.top;
        let initialScaleX = obj.scaleX;
        let initialScaleY = obj.scaleY;
        let initialAngle = obj.angle;

        const saveInitialState = () => {
            initialLeft = obj.left;
            initialTop = obj.top;
            initialScaleX = obj.scaleX;
            initialScaleY = obj.scaleY;
            initialAngle = obj.angle;
        };

        const updateRef = () => {
            ref.value = obj;
        };

        obj.on("modified", () => {
            updateRef();
            saveInitialState();
        });
        obj.on("selected", updateRef);

        (obj as any).__undoTransform = () => {
            const canvas = state.canvas;
            if (!canvas) return;

            obj.set({
                left: initialLeft,
                top: initialTop,
                scaleX: initialScaleX,
                scaleY: initialScaleY,
                angle: initialAngle,
            });
            obj.setCoords();
            canvas.endCurrentTransform();

            canvas.requestRenderAll();
        };
    }

    const handlers: HandlersMap = {
        panZoom: {
            down: (event, c) => canvasPanZoom.onMouseDown(event.e, c),
            move: (event, c) => canvasPanZoom.onMouseMove(event.e, c, state.image.active),
            up: (c) => canvasPanZoom.onMouseUp(c),
            wheel: (event, c) => canvasPanZoom.onMouseWheel(event.e, c, state.image.active),
        },

        lasso: {
            down: (event, c) => {
                if (event.target === lassoPath.value) return;

                if (lassoPath.value && state.image.active && state.image.original) {
                    c.remove(lassoPath.value);
                    lassoPath.value = null;
                    state.image.active.clipPath = undefined;
                    showOriginalImage(false);
                }
                canvasLasso.onMouseDown(event.e, c);
            },
            move: (event, c) => canvasLasso.onMouseMove(event.e, c),
            up: (c) => {
                const path = canvasLasso.onMouseUp(c);

                if (!path || !state.image.active || !state.image.original) return;

                attachObjectListeners(path, lassoPath);

                state.image.active.clipPath = path;
                showOriginalImage(true);
            },
            undo: (c) => {
                if (lassoPath.value) {
                    c.remove(lassoPath.value);
                    lassoPath.value = null;
                }
                canvasLasso.cancel(c);
            },
        },

        select: {
            down: (event, c) => {
                const mouseButton = getClickButton(event.e);
                if (mouseButton === 2 && lassoPath.value) {
                    const activeObj = c.getActiveObject();
                    if (activeObj === lassoPath.value && (activeObj as any).__undoTransform) {
                        (activeObj as any).__undoTransform();
                    }
                }
            },
            move: () => {},
            up: () => {},
            undo: (c) => {
                const activeObj = c.getActiveObject();
                if ((activeObj as any).__undoTransform) {
                    (activeObj as any).__undoTransform();
                }
            },
        },
    };

    const getHandler = (mouseButton: number, mode: CanvasModes) => {
        return mouseButton === 1 ? handlers.panZoom : handlers[mode] ?? null;
    };

    const handleMouseDown = (event: CanvasEvent) => {
        if (!state.canvas) return;

        const mouseButton = getClickButton(event.e);
        const handler = getHandler(mouseButton, currentMode.value);

        if (!handler) return;

        if (mouseButton === 1) {
            handlers.panZoom.down(event, state.canvas);
            state.isActive = true;
            currentMouseButton.value = 1;
            return;
        }
        if (state.isActive) {
            if (currentMouseButton.value !== 1 && mouseButton === 2 && handler.undo) {
                state.isActive = false;
                if (event.target?.selectable) {
                    handlers.select.undo?.(state.canvas);
                    return;
                } else {
                    handler.undo(state.canvas);
                }
            }
        } else {
            if (mouseButton !== 2) {
                state.isActive = true;
                handler.down(event, state.canvas);
            } else {
                state.canvas.requestRenderAll();
            }
        }

        currentMouseButton.value = mouseButton;
    };

    const handleMouseMove = (event: any) => {
        if (!state.canvas || !state.isActive) return;

        const handler = getHandler(currentMouseButton.value, currentMode.value);
        handler?.move(event, state.canvas);
    };

    const handleMouseUp = () => {
        if (!state.canvas || !state.isActive) return;

        state.isActive = false;
        const handler = getHandler(currentMouseButton.value, currentMode.value);
        handler?.up(state.canvas);
    };

    const handleMouseWheel = (event: any) => {
        if (!state.canvas) return;
        handlers.panZoom.wheel?.(event, state.canvas);
    };

    function setupEvents() {
        if (!state.canvas) return;

        state.canvas.on("mouse:down", handleMouseDown);
        state.canvas.on("mouse:move", handleMouseMove);
        state.canvas.on("mouse:up", handleMouseUp);
        state.canvas.on("mouse:wheel", handleMouseWheel);

        window.addEventListener("resize", handleResize);
    }

    function handleResize() {
        const { wrapperEl, canvasEl, canvas } = state;
        if (!wrapperEl || !canvasEl || !canvas) return;

        const ratio = window.devicePixelRatio || 1;
        const { clientWidth: width, clientHeight: height } = wrapperEl;

        canvasEl.width = width * ratio;
        canvasEl.height = height * ratio;
        canvasEl.style.width = `${width}px`;
        canvasEl.style.height = `${height}px`;

        canvas.setDimensions({ width, height });

        if (state.image.original) {
            canvasImage.fitContainImage(canvas, state.image.original);
        }
        if (state.image.active) {
            canvasImage.fitContainImage(canvas, state.image.active);
        }
    }

    function cleanup() {
        window.removeEventListener("resize", handleResize);

        if (state.canvas) {
            state.canvas.dispose();
        }

        Object.assign(state, INITIAL_STATE);
    }

    onDeactivated(cleanup);
    onBeforeUnmount(cleanup);

    return {
        canvas: computed(() => state.canvas),
        currentMode: readonly(currentMode),
        image: readonly(state.image),
        lassoPath: readonly(lassoPath),

        initCanvas,
        switchMode,
        addObject,
        replaceObject,
    };
}
