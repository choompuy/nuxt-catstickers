import { Canvas, FabricObject, Path } from "fabric";
import type { CanvasButton, CanvasEvent, CanvasEventWheel, CanvasHandler, CanvasModes, CanvasState, HandlersMap } from "~/types/canvas";
import { CANVAS_CONFIG, CLIP_MODES, CURSOR_MAP, UNDO_TRANSFORM } from "~/constants/canvas";
import { canvasImage } from "~/lib/canvasImage";
import { canvasPanZoom } from "~/lib/canvasPanZoom";
import { canvasEllipse, canvasLasso, canvasRect } from "~/lib/canvasClip";
import { canvasText } from "~/lib/canvasText";

type hotkeysModifiers = ReturnType<typeof useHotkeys>["modifiers"];

const INITIAL_STATE: CanvasState = {
    wrapperEl: null,
    canvasEl: null,
    canvas: null,
    image: { original: null, active: null },
    isActive: false,
};

export function useCanvas() {
    const state: CanvasState = { ...INITIAL_STATE };

    const history = useCanvasHistory({
        state: state,
        switchMode(mode) {
            if (currentMode.value === mode) return;
            switchMode(mode);
        },
    });

    let keyboardModifiers: hotkeysModifiers | null = null;
    const currentMode = ref<CanvasModes>("panZoom");
    const currentButton = ref<CanvasButton>(0);
    const currentZoom = ref<number>(0);
    const objectListeners = new WeakMap<
        any,
        {
            handlers: {
                modified: () => void;
            };
            state: any;
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

    async function initCanvas(wrapperElement: HTMLElement, canvasElement: HTMLCanvasElement, imageUrl: string, modifiers?: hotkeysModifiers) {
        state.wrapperEl = wrapperElement;
        state.canvasEl = canvasElement;
        state.canvas = new Canvas(canvasElement, {
            ...CANVAS_CONFIG,
            width: wrapperElement.clientWidth,
            height: wrapperElement.clientHeight,
        });
        keyboardModifiers = modifiers || null;

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
        currentZoom.value = state.canvas.getZoom();
        history.init();

        updateCursors(currentMode.value);
        handleResize();

        state.canvas.on("mouse:down", handleMouseDown);
        state.canvas.on("mouse:move", handleMouseMove);
        state.canvas.on("mouse:up", handleMouseUp);
        state.canvas.on("mouse:wheel", handleMouseWheel);
        window.addEventListener("resize", handleResize);
    }

    function switchMode(mode: CanvasModes) {
        if (!state.canvas || mode === currentMode.value) return;

        const isClip = CLIP_MODES.includes(mode);
        showOriginalImage(isClip);

        const clip = state.image.active?.clipPath as FabricObject | undefined;

        if (isClip && clip) {
            state.canvas.setActiveObject(clip);
        } else {
            state.canvas.discardActiveObject();
        }

        state.canvas.skipTargetFind = mode === "panZoom";
        updateCursors(mode);
        state.canvas.requestRenderAll();
        currentMode.value = mode;
    }

    function addObject(obj: FabricObject | Path, label?: string) {
        if (!state.canvas) return;
        state.canvas.add(obj);
        state.canvas.setActiveObject(obj);
        state.canvas.requestRenderAll();
        history.push({ type: "add", object: obj }, { label: label || "Add object" });
    }

    const replaceObject = (oldObj: FabricObject, newObj: FabricObject, label?: string) => {
        if (!state.canvas) return;
        const index = state.canvas.getObjects().indexOf(oldObj);
        if (index === -1) return;

        state.canvas.remove(oldObj);
        state.canvas.insertAt(index, newObj);
        state.canvas.requestRenderAll();

        history.push({ type: "replace", oldObject: oldObj, newObject: newObj }, { label: label || "Replace object" });
    };

    const detachObjectListeners = (obj: FabricObject) => {
        const data = objectListeners.get(obj);
        if (!data) return;

        obj.off("modified", data.handlers.modified);
        delete (obj as any)[UNDO_TRANSFORM];

        objectListeners.delete(obj);
    };

    const attachObjectListeners = (obj: FabricObject, mode?: CanvasModes) => {
        if (objectListeners.has(obj)) {
            detachObjectListeners(obj);
        }

        let lastState = history.saveState(obj);

        const onModified = () => {
            const newState = history.saveState(obj);
            if (!hasTransformChanged(lastState, newState)) return;

            history.push(
                {
                    type: "transform",
                    object: obj,
                    before: lastState,
                    after: newState,
                },
                { label: "Transform", mode },
            );

            lastState = newState;

            const data = objectListeners.get(obj);
            if (data) data.state = lastState;
        };

        const undoTransform = () => {
            const data = objectListeners.get(obj);
            if (!data) return;

            history.restoreState(obj, data.state);
            state.canvas?.endCurrentTransform();
            state.canvas?.requestRenderAll();
        };

        obj.on("modified", onModified);
        (obj as any)[UNDO_TRANSFORM] = undoTransform;

        objectListeners.set(obj, {
            handlers: {
                modified: onModified,
            },
            state: lastState,
        });
    };

    const addClipShape = (shape: FabricObject, needHistory = false) => {
        if (!shape || !state.canvas || !state.image.active) return;

        state.canvas.add(shape);
        state.canvas.setActiveObject(shape);
        state.image.active.clipPath = shape;

        if (needHistory) {
            history.push(
                { type: "default", before: clearClipShape, after: () => addClipShape(shape) },
                { label: `Draw ${currentMode.value}`, mode: currentMode.value },
            );
        }

        attachObjectListeners(shape, currentMode.value);
        showOriginalImage(true);
    };

    const clearClipShape = (needHistory = false) => {
        if (!state.canvas) return;

        const image = state.image.active;
        const clip = image?.clipPath as FabricObject | undefined;

        if (!image || !clip) return;

        detachObjectListeners(clip);

        if (needHistory) {
            history.push({ type: "default", before: () => addClipShape(clip), after: clearClipShape }, { label: "Clear clip" });
        }

        state.canvas.remove(clip);
        clip.dispose();
        image.clipPath = undefined;
        showOriginalImage(false);
    };

    const createCropHandler = (tool: typeof canvasLasso | typeof canvasRect | typeof canvasEllipse): CanvasHandler => ({
        down: (event, c) => {
            if (!state.image.active || (event.target && event.target === state.image.active.clipPath)) return;

            if (event.target && event.target.type !== "image") {
                c.discardActiveObject();
            }

            if (state.image.active.clipPath) clearClipShape(true);
            tool.down(event, c);
        },
        move: (event, c) =>
            tool.move(event, c, {
                shift: keyboardModifiers?.shift.value ?? false,
                ctrl: keyboardModifiers?.ctrl.value ?? false,
                alt: keyboardModifiers?.alt.value ?? false,
            }),

        up: (c) => {
            if (!state.image.active) return;
            const shape = tool.up(c);

            if (!shape) return;

            addClipShape(shape, true);
        },
        undo: (c) => {
            if (state.image.active && state.image.active.clipPath) clearClipShape(true);
            tool.undo(c);
        },
    });

    const handlers: HandlersMap = {
        move: {
            down: (event, c) => {
                if (!state.image.active) return;
                if (event.target === state.image.active.clipPath) {
                    c.discardActiveObject();
                }
            },
            move: () => {},
            up: () => {},
            undo: (c) => (c.getActiveObject() as any)?.[UNDO_TRANSFORM]?.(),
        },

        panZoom: {
            down: (event, c) => canvasPanZoom.down(event, c),
            move: (event, c) => canvasPanZoom.mouseMove(event, c, state.image.active),
            up: (c) => canvasPanZoom.up(c),
        },

        lasso: createCropHandler(canvasLasso),
        rect: createCropHandler(canvasRect),
        ellipse: createCropHandler(canvasEllipse),

        text: {
            down: (event, c) => {
                if (event.target?.type === "textbox") return;

                switchMode("move");
                const text = canvasText.down(event, c);
                if (text) attachObjectListeners(text, "text");
            },
            move: () => {},
            up: () => {},
        },
    };

    const getHandler = (button: number, mode: CanvasModes) => (button === 1 ? handlers.panZoom : (handlers[mode] ?? null));

    const buttonActions = {
        0: (event: CanvasEvent, handler: any) => {
            if (!state.canvas) return;
            state.isActive = true;
            handler.down(event, state.canvas);
        },
        1: (event: CanvasEvent) => {
            if (!state.canvas) return;
            handlers.panZoom.down(event, state.canvas);
            state.isActive = true;
            currentButton.value = 1;
        },
        2: (event: CanvasEvent, handler: any) => {
            if (!state.canvas) return;
            if (state.isActive && currentButton.value !== 1) {
                state.isActive = false;

                if ((state.canvas.getActiveObject() as any)[UNDO_TRANSFORM]) {
                    (state.canvas.getActiveObject() as any)[UNDO_TRANSFORM]();
                    return;
                }

                handlers[currentMode.value].undo?.(state.canvas);
            } else {
                state.canvas.requestRenderAll();
            }
        },
    } as const;

    const handleMouseDown = (event: CanvasEvent) => {
        if (!state.canvas) return;

        const input = getCanvasInput(event);
        const handler = getHandler(input.button, currentMode.value);
        if (!handler) return;

        buttonActions[input.button]?.(event, handler);
        currentButton.value = input.button;
    };

    const handleTouchMove = (event: CanvasEvent, handler: CanvasHandler) => {
        if (!state.canvas) return;

        if (currentMode.value === "panZoom") {
            canvasPanZoom.touchMove(event, state.canvas, state.image.active);
            return true;
        }

        if (getCanvasInput(event).button === 1) {
            handler.undo?.(state.canvas);

            if (state.canvas._currentTransform && event.target?.selectable) {
                state.canvas.endCurrentTransform();
            }
            canvasPanZoom.touchMove(event, state.canvas, state.image.active);
            currentButton.value = 1;
            return true;
        }

        return false;
    };

    const handleMouseMove = (event: CanvasEvent) => {
        if (!state.canvas || !state.isActive) return;

        const handler = getHandler(currentButton.value, currentMode.value);
        if (!handler) return;

        const input = getCanvasInput(event);
        if (input.device === "touch" && handleTouchMove(event, handler)) return;

        handler.move(event, state.canvas);
    };

    const handleMouseUp = () => {
        if (!state.canvas || !state.isActive) return;
        state.isActive = false;
        getHandler(currentButton.value, currentMode.value)?.up(state.canvas);
    };

    const handleMouseWheel = (event: CanvasEventWheel) => {
        if (!state.canvas) return;

        if (keyboardModifiers?.shift.value) {
            canvasPanZoom.wheel(event, state.canvas, false);
            return;
        }

        if (keyboardModifiers?.ctrl.value) {
            canvasPanZoom.wheelZoom(event, state.canvas, state.image.active);
            currentZoom.value = state.canvas.getZoom();
            return;
        }

        canvasPanZoom.wheel(event, state.canvas);
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
        currentZoom: readonly(currentZoom),
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
