import type { ShallowRef } from "vue";
import { Canvas, FabricObject, Path } from "fabric";
import type { CanvasButton, CanvasEvent, CanvasHistoryEntry, CanvasModes, CanvasState, HandlersMap } from "~/types/canvas";
import { CANVAS_CONFIG, CURSOR_MAP, INITIAL_STATE } from "~/constants/canvas";
import { canvasImage } from "~/lib/canvasImage";
import { canvasPanZoom } from "~/lib/canvasPanZoom";
import { canvasLasso } from "~/lib/canvasLasso";

export function useCanvas() {
    const state: CanvasState = {
        wrapperEl: null,
        canvasEl: null,
        canvas: null,
        image: { original: null, active: null },
        isActive: false,
        entities: {
            lasso: shallowRef(null),
            selection: shallowRef(null),
        },
        input: {
            device: "mouse",
            button: 0,
        },
    };

    const history = useCanvasHistory(state);

    const currentMode = ref<CanvasModes>("panZoom");
    const currentButton = ref<CanvasButton>(0);
    const objectListeners = new WeakMap<
        FabricObject | Path,
        {
            handlers: {
                modified: () => void;
                selected: () => void;
            };
            ref: ShallowRef<FabricObject | Path | null>;
            initialState: any;
        }
    >();

    const updateCursors = (mode: CanvasModes) => {
        if (!state.canvas) return;
        const { default: def, hover } = CURSOR_MAP[mode] ?? CURSOR_MAP.panZoom;
        state.canvas.defaultCursor = def;
        state.canvas.hoverCursor = hover;
    };

    const showOriginalImage = (show: boolean) => {
        if (state.image.original) state.image.original.opacity = show ? 0.3 : 0;
    };

    async function initCanvas(wrapperElement: HTMLElement, canvasElement: HTMLCanvasElement, imageUrl: string) {
        state.wrapperEl = wrapperElement;
        state.canvasEl = canvasElement;
        state.canvas = new Canvas(canvasElement, {
            ...CANVAS_CONFIG,
            width: wrapperElement.clientWidth,
            height: wrapperElement.clientHeight,
        });

        const [img, clone] = await Promise.all([canvasImage.loadImage(imageUrl), canvasImage.loadImage(imageUrl).then((i) => i.clone())]);

        [img, clone].forEach((i) => {
            i.selectable = false;
            canvasImage.scaleToFitImage(state.canvas!, i);
            state.canvas!.add(i);
        });

        clone.opacity = 0;
        state.canvas.sendObjectToBack(clone);
        state.image = {
            original: clone,
            active: img,
        };

        switchMode(currentMode.value);
        handleResize();

        state.canvas.on("mouse:down", handleMouseDown);
        state.canvas.on("mouse:move", handleMouseMove);
        state.canvas.on("mouse:up", handleMouseUp);
        state.canvas.on("mouse:wheel", handleMouseWheel);
        window.addEventListener("resize", handleResize);
    }

    function switchMode(mode: CanvasModes) {
        if (!state.canvas || mode === currentMode.value) return;

        const isLasso = mode === "lasso";
        showOriginalImage(isLasso);

        if (isLasso && state.entities.lasso.value) {
            state.canvas.setActiveObject(state.entities.lasso.value);
        } else {
            state.canvas.discardActiveObject();
        }

        state.canvas.skipTargetFind = mode === "panZoom";
        updateCursors(mode);
        state.canvas.requestRenderAll();
        currentMode.value = mode;
    }

    function addObject(obj: FabricObject | Path) {
        if (!state.canvas) return;
        state.canvas.add(obj);
        state.canvas.setActiveObject(obj);
        state.canvas.requestRenderAll();
        history.push({ type: "add", object: obj });
    }

    const replaceObject = (oldObj: FabricObject, newObj: FabricObject) => {
        if (!state.canvas) return;
        const index = state.canvas.getObjects().indexOf(oldObj);
        if (index === -1) return;

        state.canvas.remove(oldObj);
        state.canvas.insertAt(index, newObj);
        state.canvas.requestRenderAll();
        history.push({ type: "replace", oldObject: oldObj, newObject: newObj });
    };

    const attachObjectListeners = (obj: FabricObject | Path, ref: ShallowRef<FabricObject | null>) => {
        if (objectListeners.has(obj)) {
            detachObjectListeners(obj);
        }

        ref.value = obj;
        let initialState = history.saveState(obj);

        const onModified = () => {
            const newState = history.saveState(obj);
            if (JSON.stringify(initialState) === JSON.stringify(newState)) return;

            history.push({
                type: "transform",
                object: obj,
                before: initialState,
                after: newState,
            });

            initialState = newState;
            ref.value = obj;

            const data = objectListeners.get(obj);
            if (data) data.initialState = initialState;
        };

        const onSelected = () => {
            ref.value = obj;
        };

        const undoTransform = () => {
            const data = objectListeners.get(obj);
            if (!data) return;

            history.restoreState(obj, data.initialState);
            state.canvas?.endCurrentTransform();
            state.canvas?.requestRenderAll();
        };

        obj.on("modified", onModified);
        obj.on("selected", onSelected);
        (obj as any).__undoTransform = undoTransform;

        objectListeners.set(obj, {
            handlers: {
                modified: onModified,
                selected: onSelected,
            },
            ref,
            initialState,
        });
    };

    const detachObjectListeners = (obj: FabricObject) => {
        const data = objectListeners.get(obj);
        if (!data) return;

        obj.off("modified", data.handlers.modified);
        obj.off("selected", data.handlers.selected);
        delete (obj as any).__undoTransform;

        objectListeners.delete(obj);
    };

    const addLasso = (path: Path) => {
        if (!state.canvas || !state.image.active) return;

        state.canvas.add(path);
        state.canvas.setActiveObject(path);
        state.image.active.clipPath = path;

        attachObjectListeners(path, state.entities.lasso);
        showOriginalImage(true);
    };

    const clearLasso = (needHistory = false) => {
        if (!state.canvas || !state.entities.lasso.value || !state.image.active) return;

        const lasso = state.entities.lasso.value;
        detachObjectListeners(lasso);

        if (needHistory) {
            history.push({
                type: "lasso",
                before: () => addLasso(lasso),
                after: clearLasso,
            });
        }

        state.canvas.remove(lasso);
        state.entities.lasso.value = null;
        state.image.active.clipPath = undefined;

        showOriginalImage(false);
    };

    const handlers: HandlersMap = {
        panZoom: {
            down: (event, c) => canvasPanZoom.onMouseDown(event.e, c),
            move: (event, c) => canvasPanZoom.onMouseMove(event.e, c, state.image.active),
            up: (c) => canvasPanZoom.onMouseUp(c),
            wheel: (event, c) => canvasPanZoom.onMouseWheel(event.e, c, state.image.active),
        },

        lasso: {
            down: (event, c) => {
                if (event.target === state.entities.lasso.value) return;
                if (state.entities.lasso.value) clearLasso(true);
                canvasLasso.onMouseDown(event.e, c);
            },
            move: (event, c) => canvasLasso.onMouseMove(event.e, c),
            up: (c) => {
                if (!state.image.active) return;
                const path = canvasLasso.onMouseUp(c);
                if (!path) return;

                addLasso(path);
                history.push({
                    type: "lasso",
                    before: clearLasso,
                    after: () => addLasso(path),
                });
            },
            undo: (c) => {
                if (state.entities.lasso.value) clearLasso(true);
                canvasLasso.cancel(c);
            },
        },

        select: {
            down: (event, c) => {
                if (getCanvasInput(event.e).button === 2 && state.entities.lasso.value) {
                    const activeObj = c.getActiveObject();
                    if (activeObj === state.entities.lasso.value) (activeObj as any).__undoTransform?.();
                }
            },
            move: () => {},
            up: () => {},
            undo: (c) => (c.getActiveObject() as any)?.__undoTransform?.(),
        },
    };

    const getHandler = (button: number, mode: CanvasModes) => (button === 1 ? handlers.panZoom : (handlers[mode] ?? null));

    const activatePanZoom = (event: CanvasEvent) => {
        if (!state.canvas) return;
        handlers.panZoom.down(event, state.canvas);
        state.isActive = true;
        currentButton.value = 1;
    };

    const executeUndo = (handler: any, target?: any) => {
        if (!state.canvas) return;
        target?.selectable ? handlers.select.undo?.(state.canvas) : handler.undo?.(state.canvas);
    };

    const activateHandler = (event: CanvasEvent, handler: any) => {
        if (!state.canvas) return;
        state.isActive = true;
        handler.down(event, state.canvas);
    };

    const buttonActions = {
        0: (event: CanvasEvent, handler: any) => activateHandler(event, handler),

        1: activatePanZoom,

        2: (event: CanvasEvent, handler: any) => {
            if (!state.canvas) return;
            if (state.isActive && currentButton.value !== 1) {
                state.isActive = false;
                executeUndo(handler, event.target);
            } else {
                state.canvas.requestRenderAll();
            }
        },
    } as const;

    const handleMouseDown = (event: CanvasEvent) => {
        if (!state.canvas) return;

        const input = getCanvasInput(event.e);
        const handler = getHandler(input.button, currentMode.value);
        if (!handler) return;

        buttonActions[input.button]?.(event, handler);
        currentButton.value = input.button;
    };

    const handleMouseMove = (event: CanvasEvent) => {
        if (!state.canvas || !state.isActive) return;

        const handler = getHandler(currentButton.value, currentMode.value);
        if (!handler) return;

        const input = getCanvasInput(event.e);
        if (input.device === "touch") {
            if (currentMode.value === "panZoom") {
                canvasPanZoom.onTouchMove(event.e, state.canvas, state.image.active);
                return;
            }

            if (input.button === 1) {
                if (currentMode.value === "lasso") canvasLasso.cancel(state.canvas);
                if (state.canvas._currentTransform && event.target?.selectable) {
                    state.canvas.endCurrentTransform();
                }
                canvasPanZoom.onTouchMove(event.e, state.canvas, state.image.active);
                currentButton.value = 1;
                return;
            }

            handler.move(event, state.canvas);
            return;
        }

        handler.move(event, state.canvas);
    };

    const handleMouseUp = () => {
        if (!state.canvas || !state.isActive) return;
        state.isActive = false;
        getHandler(currentButton.value, currentMode.value)?.up(state.canvas);
    };

    const handleMouseWheel = (event: any) => {
        state.canvas && handlers.panZoom.wheel?.(event, state.canvas);
    };

    function handleResize() {
        const { wrapperEl, canvasEl, canvas, image } = state;
        if (!wrapperEl || !canvasEl || !canvas) return;

        const ratio = window.devicePixelRatio || 1;
        const { clientWidth: w, clientHeight: h } = wrapperEl;

        Object.assign(canvasEl, { width: w * ratio, height: h * ratio });
        Object.assign(canvasEl.style, { width: `${w}px`, height: `${h}px` });

        canvas.setDimensions({ width: w, height: h });
        [image.original, image.active].forEach((img) => img && canvasImage.fitContainImage(canvas, img));
    }

    function cleanup() {
        window.removeEventListener("resize", handleResize);
        state.canvas?.dispose();
        history.clear();
        Object.assign(state, INITIAL_STATE);
    }

    onDeactivated(cleanup);
    onBeforeUnmount(cleanup);

    return {
        canvas: computed(() => state.canvas),
        currentMode: readonly(currentMode),
        image: readonly(state.image),
        history: history.exposed,
        initCanvas,
        switchMode,
        addObject,
        replaceObject,
        undo: history.undo,
        redo: history.redo,
        goTo: history.goTo,
    };
}
