import { Canvas, FabricObject } from "fabric";
import type {
    CanvasButton,
    CanvasEvent,
    CanvasEventWheel,
    CanvasHandler,
    CanvasModes,
    CanvasState,
    CanvasHandlerMap,
    CanvasInput,
} from "~/types/canvas";
import { CANVAS_CONFIG, CLIP_MODES, CURSOR_MAP } from "~/constants/canvas";
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

    const controller = useCanvasController({ state });

    let keyboardModifiers: hotkeysModifiers | null = null;
    const currentMode = ref<CanvasModes>("panZoom");
    const currentButton = ref<CanvasButton>(0);
    const currentZoom = ref<number>(0);

    // Store event handler references for proper cleanup
    let canvasEventHandlers: {
        mouseDown: (e: CanvasEvent) => void;
        mouseMove: (e: CanvasEvent) => void;
        mouseUp: () => void;
        mouseWheel: (e: CanvasEventWheel) => void;
        handleResize: () => void;
    } | null = null;

    const updateCursors = (mode: CanvasModes) => {
        if (!state.canvas) return;
        const { default: def, hover } = CURSOR_MAP[mode] ?? CURSOR_MAP.panZoom;
        state.canvas.defaultCursor = def;
        state.canvas.hoverCursor = hover;
    };

    const showOriginalImage = (show: boolean) => {
        if (state.image.original) state.image.original.opacity = show ? 0.3 : 0;
    };

    async function initCanvas(
        wrapperElement: HTMLElement,
        canvasElement: HTMLCanvasElement,
        imageUrl: string,
        modifiers?: hotkeysModifiers
    ) {
        state.wrapperEl = wrapperElement;
        state.canvasEl = canvasElement;
        state.canvas = new Canvas(canvasElement, {
            ...CANVAS_CONFIG,
            width: wrapperElement.clientWidth,
            height: wrapperElement.clientHeight,
        });
        keyboardModifiers = modifiers || null;
        const c = state.canvas;

        const img = await canvasImage.loadImage(imageUrl);
        const clone = await img.clone();

        [clone, img].forEach((i) => {
            i.selectable = false;
            i.evented = false;
            canvasImage.scaleToFitImage(c!, i);
            c!.add(i);
        });

        clone.opacity = 0;
        state.image = {
            original: clone,
            active: img,
        };
        currentZoom.value = c.getZoom();

        controller.init();

        updateCursors(currentMode.value);
        handleResize();

        // Store handler references for cleanup
        canvasEventHandlers = {
            mouseDown: handleMouseDown,
            mouseMove: handleMouseMove,
            mouseUp: handleMouseUp,
            mouseWheel: handleMouseWheel,
            handleResize,
        };

        c.on("mouse:down", canvasEventHandlers.mouseDown);
        c.on("mouse:move", canvasEventHandlers.mouseMove);
        c.on("mouse:up", canvasEventHandlers.mouseUp);
        c.on("mouse:wheel", canvasEventHandlers.mouseWheel);
        window.addEventListener("resize", canvasEventHandlers.handleResize);
    }

    function switchMode(mode: CanvasModes) {
        if (mode === currentMode.value || !state.canvas) return;

        const isClip = CLIP_MODES.includes(mode);
        const image = state.image.active;
        const clip = image?.clipPath as FabricObject | undefined;

        showOriginalImage(isClip);

        if (clip) {
            if (isClip) {
                clip.selectable = true;
                clip.evented = true;
                controller.moveObjectTo(clip, -1);
                setCanvasActiveObject(state.canvas, clip);
            } else {
                clip.selectable = false;
                clip.evented = false;
                if (state.canvas.getActiveObject() === clip) state.canvas.discardActiveObject();
            }
        }

        state.canvas.skipTargetFind = mode === "panZoom";
        updateCursors(mode);
        controller.requestRender();
        currentMode.value = mode;
    }

    const clearClipShape = () => {
        const image = state.image.active;
        if (!image) return;

        const clip = image.clipPath as FabricObject | undefined;
        if (!clip) return;

        controller.removeObject(clip);
        image.clipPath = undefined;
        showOriginalImage(false);
    };

    const addClipShape = (shape: FabricObject, mode?: CanvasModes) => {
        if (!state.image.active) return;

        controller.addObject(shape);
        controller.attachObject(shape, { mode });
        state.image.active.clipPath = shape;
        showOriginalImage(true);
    };

    const createCropHandler = (
        tool: typeof canvasLasso | typeof canvasRect | typeof canvasEllipse
    ): CanvasHandler => {
        const clearHistory = () => {
            const clip = state.image.active?.clipPath as FabricObject | undefined;
            if (!clip) return;

            controller.history.command({
                label: "Clear clip",
                undo: () => addClipShape(clip, tool.getMode()),
                redo: clearClipShape,
            });
        };

        return {
            down: (event, c) => {
                if (
                    !state.image.active ||
                    (event.target && event.target === state.image.active.clipPath)
                )
                    return;

                if (event.target && event.target.type !== "image") {
                    c.discardActiveObject();
                }

                clearHistory();

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
                const mode = tool.getMode();

                controller.history.command({
                    label: `Draw ${mode}`,
                    mode,
                    undo: clearClipShape,
                    redo: () => addClipShape(shape, mode),
                });
            },
            undo: (c) => {
                clearHistory();
                tool.undo(c);
            },
        };
    };

    const handlers: CanvasHandlerMap = {
        move: {
            down: (event, c) => {
                if (!state.image.active) return;
                if (event.target === state.image.active.clipPath) {
                    c.discardActiveObject();
                }
            },
            move: () => {},
            up: () => {},
            undo: (c) => {
                const obj = c.getActiveObject();

                if (obj && controller.undoTransform(obj)) return;
            },
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

                const id = crypto.randomUUID();

                const text = canvasText.down(event, c, (t) => {
                    controller.removeObject(text);

                    if (!t) return;

                    controller.history.command({
                        label: "Add text",
                        mode: "text",
                        undo: () => {
                            controller.removeLayer(id, true);
                        },
                        redo: () => {
                            controller.addLayer(
                                { id, type: "textbox", label: "Text", object: t },
                                undefined,
                                true
                            );
                            controller.attachObject(t, { mode: "text" });
                        },
                    });
                });

                controller.addObject(text);
            },
            move: () => {},
            up: () => {},
            undo: (c) => {
                canvasText.undo(c);
            },
        },
    };

    const getHandler = (button: CanvasButton, mode: CanvasModes) =>
        button === 1 ? handlers.panZoom : (handlers[mode] ?? null);

    const undoActiveAction = () => {
        if (!state.canvas) return false;

        if (state.isActive && currentButton.value !== 1) {
            const obj = state.canvas.getActiveObject();

            if (!obj || !controller.undoTransform(obj))
                handlers[currentMode.value].undo?.(state.canvas);

            return true;
        }

        return false;
    };

    const buttonActions = {
        0: (event: CanvasEvent, handler: CanvasHandler) => {
            if (!state.canvas) return;
            state.isActive = true;
            handler.down(event, state.canvas);
        },
        1: (event: CanvasEvent) => {
            if (!state.canvas) return;

            undoActiveAction();

            handlers.panZoom.down(event, state.canvas);
            state.isActive = true;
        },
        2: (_event: CanvasEvent, _handler: CanvasHandler) => {
            if (!state.canvas) return;

            if (undoActiveAction()) state.isActive = false;
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

    const handleTouchMove = (_event: CanvasEvent, _handler: CanvasHandler, input: CanvasInput) => {
        if (!state.canvas) return;

        if (currentMode.value === "panZoom") {
            canvasPanZoom.touchMove(_event, state.canvas, state.image.active);
            return true;
        }

        if (input.button === 1) {
            _handler.undo?.(state.canvas);

            if (state.canvas._currentTransform && _event.target?.selectable) {
                state.canvas.endCurrentTransform();
            }
            canvasPanZoom.touchMove(_event, state.canvas, state.image.active);
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
        if (input.device === "touch" && handleTouchMove(event, handler, input)) return;

        handler.move(event, state.canvas);
    };

    const handleMouseUp = () => {
        if (!state.canvas || !state.isActive) return;
        state.isActive = false;
        const handler = getHandler(currentButton.value, currentMode.value);
        handler?.up?.(state.canvas);
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
        [image.original, image.active].forEach(
            (img) => img && canvasImage.fitContainImage(canvas, img)
        );
    }

    function cleanup() {
        // Remove window resize listener
        if (canvasEventHandlers) {
            window.removeEventListener("resize", canvasEventHandlers.handleResize);
        }

        // Remove all canvas event listeners before disposing
        if (state.canvas && canvasEventHandlers) {
            state.canvas.off("mouse:down", canvasEventHandlers.mouseDown);
            state.canvas.off("mouse:move", canvasEventHandlers.mouseMove);
            state.canvas.off("mouse:up", canvasEventHandlers.mouseUp);
            state.canvas.off("mouse:wheel", canvasEventHandlers.mouseWheel);
        }

        // Clear canvas and dispose
        state.canvas?.dispose();
        controller.history.clear();
        Object.assign(state, INITIAL_STATE);

        // Clear handler references
        canvasEventHandlers = null;
    }

    onDeactivated(cleanup);
    onBeforeUnmount(cleanup);

    return {
        core: {
            initCanvas,
            switchMode,
            handleResize,

            canvas: computed(() => state.canvas),
            currentMode: readonly(currentMode),
            currentZoom: readonly(currentZoom),
            image: readonly(state.image),
        },

        history: {
            exposed: controller.history.exposed,
            undo: controller.history.undo,
            redo: controller.history.redo,
            goTo: controller.history.goTo,
        },

        layers: {
            selectedObject: controller.selectedObject,
            layersList: controller.layersList,
            selectObject: controller.selectObject,
            updateObject: controller.updateObject,
            toggleVisibility: controller.toggleLayerVisibility,
        },
    };
}
