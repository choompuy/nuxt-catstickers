import { type FabricObject } from "fabric";
import type { CanvasLayerEntry, CanvasModes, CanvasState } from "~/types/canvas";
import { OBJECT_EVENTS, SCENE_INDEX } from "~/constants/canvas";
import type { CanvasObjectTypes, CanvasObjectState } from "~/types/canvasObject";

interface CanvasLayersOptions {
    state: CanvasState;
}

interface CanvasObjectMeta {
    label?: string;
    mode?: CanvasModes;
}

export function useCanvasController(options: CanvasLayersOptions) {
    const { state } = options;

    const history = useCanvasHistory({
        onChange: requestRender,
    });

    let renderRaf: number | null = null;
    const selectedObject = ref({
        type: <CanvasObjectTypes | null>null,
        state: <CanvasObjectState | null>reactive({}),
    });
    const selectedCleanup = new WeakMap<FabricObject, () => void>();
    const objectsById = new Map<string, FabricObject>();
    const objectListeners = new WeakMap<
        FabricObject,
        {
            modified: () => void;
            state: any;
        }
    >();
    const layersMap = shallowReactive(new Map<string, CanvasLayerEntry>());
    const layersOrder = ref<string[]>([]);
    const layersList = computed(() => layersOrder.value.map((id) => layersMap.get(id)!));

    function init() {
        if (!state.canvas) return;

        history.init();

        const c = state.canvas;

        c.on("selection:created", syncSelection);
        c.on("selection:updated", syncSelection);
        c.on("selection:cleared", clearSelection);
    }

    function requestRender() {
        if (renderRaf !== null) return;

        renderRaf = requestAnimationFrame(() => {
            renderRaf = null;
            state.canvas?.requestRenderAll();
        });
    }

    function spliceOrder(index: number, deleteCount: number, ...items: string[]) {
        layersOrder.value.splice(index, deleteCount, ...items);
    }

    const getObject = (objId: string) => objectsById.get(objId);

    function selectObject(id: string) {
        if (!state.canvas) return;

        const obj = getObject(id);
        if (!obj) return;

        state.canvas.setActiveObject(obj);
        requestRender();
    }

    function attachSelectedObject(obj: FabricObject) {
        detachSelectedObject(obj);

        const handler = () => {
            const next = getSanitizedState(obj);

            if (!selectedObject.value.state) {
                selectedObject.value.state = reactive(next);
                return;
            }

            Object.assign(selectedObject.value.state, next);
        };

        OBJECT_EVENTS.forEach((e) => obj.on(e, handler));

        selectedCleanup.set(obj, () => {
            OBJECT_EVENTS.forEach((e) => obj.off(e, handler));
        });
    }

    function detachSelectedObject(obj: FabricObject) {
        selectedCleanup.get(obj)?.();
        selectedCleanup.delete(obj);
    }

    function clearSelection() {
        const id = selectedObject.value.state?.ID;

        if (id) {
            const oldObj = getObject(id);
            if (oldObj) detachSelectedObject(oldObj);
        }

        selectedObject.value = {
            type: null,
            state: null,
        };
    }

    function syncSelection(e: any | null) {
        const obj: FabricObject | undefined = e.selected?.[0];
        const id = obj?.get("ID");

        clearSelection();

        if (!obj || !id) {
            return;
        }

        selectedObject.value = {
            type: obj.type.toLowerCase() as CanvasObjectTypes,
            state: getSanitizedState(obj),
        };

        attachSelectedObject(obj);
    }

    function setObject(obj: FabricObject, state: any) {
        obj.set(state);
        obj.setCoords();
        requestRender();
    }

    function moveObjectTo(obj: FabricObject, index: number) {
        if (!state.canvas) return;

        if (index >= 0) {
            state.canvas.moveObjectTo(
                obj,
                index < 0 ? index : index + SCENE_INDEX.USER_LAYERS_START
            );
        } else if (index === -1) {
            state.canvas.bringObjectToFront(obj);
        } else {
            state.canvas.moveObjectTo(obj, index + 1);
        }
    }

    function addObject(obj: FabricObject, options?: { id?: string; index?: number }) {
        if (!state.canvas) return;

        const id = options?.id || crypto.randomUUID();
        obj.set("ID", id);
        objectsById.set(id, obj);

        state.canvas.add(obj);
        state.canvas.setActiveObject(obj);

        if (options?.index !== undefined) {
            moveObjectTo(obj, options.index);
        }
    }

    function removeObject(obj: FabricObject) {
        if (!state.canvas) return;

        const id = (obj as any)["ID"];
        if (id) objectsById.delete(id);

        detachObject(obj);
        state.canvas.remove(obj);
    }

    function updateObject(
        id: string,
        changes: Partial<CanvasObjectState>,
        meta?: CanvasObjectMeta
    ) {
        const obj = getObject(id);
        if (!obj) return;

        setObject(obj, changes);
        const layer = layersMap.get(id);
        if (layer) Object.assign(layer, changes);

        if (selectedObject.value.state?.ID === id) {
            Object.assign(selectedObject.value.state, changes);
        }
    }

    function detachObject(obj: FabricObject) {
        const data = objectListeners.get(obj);
        if (!data) return;

        obj.off("modified", data.modified);
        objectListeners.delete(obj);
    }

    function attachObject(obj: FabricObject, options?: { mode?: CanvasModes }) {
        detachObject(obj);

        let prev = getSanitizedState(obj);

        const onModified = () => {
            const next = getSanitizedState(obj);
            const diff = getCanvasObjectDiff(prev, next);

            if (!diff) return;

            history.update((state) => setObject(obj, state), prev, next, {
                label: diff,
                mode: options?.mode,
            });

            prev = next;
        };

        obj.on("modified", onModified);

        objectListeners.set(obj, {
            modified: onModified,
            state: prev,
        });
    }

    function undoTransform(obj: FabricObject) {
        const data = objectListeners.get(obj);
        if (!data) return false;

        setObject(obj, data.state);

        state.canvas?.endCurrentTransform();

        return true;
    }

    function addLayer(layer: CanvasLayerEntry, index?: number, skipHistory = false) {
        const insertIndex = index ?? layersOrder.value.length;

        layersMap.set(layer.id, layer);

        spliceOrder(insertIndex, 0, layer.id);

        addObject(layer.object, { id: layer.id, index: insertIndex });
        requestRender();

        if (!skipHistory) {
            history.command({
                label: "Add layer",
                undo: () => removeLayer(layer.id, true),
                redo: () => addLayer(layer, insertIndex, true),
            });
        }
    }

    function removeLayer(id: string, skipHistory = false) {
        const index = layersOrder.value.indexOf(id);
        if (index !== -1) {
            spliceOrder(index, 1);
        }

        const layer = layersMap.get(id);
        if (!layer) return;

        layersMap.delete(id);

        removeObject(layer.object as FabricObject);
        requestRender();

        if (!skipHistory) {
            history.command({
                label: "Remove layer",
                undo: () => addLayer(layer, index, true),
                redo: () => removeLayer(layer.id, true),
            });
        }
    }

    function updateLayer(
        id: string,
        changes: Partial<CanvasLayerEntry>,
        options: CanvasObjectMeta & { skipHistory?: boolean } = {}
    ) {
        const layer = layersMap.get(id);
        if (!layer) return;

        const prev = layer;

        history.update((target) => Object.assign(layer, target), prev, changes, {
            label: "Update layer",
        });

        requestRender();
    }

    function toggleLayerVisibility(id: string) {
        const layer = layersMap.get(id);
        if (!layer) return;

        const visible = !(layer.visible ?? true);

        updateObject(id, { visible }, { label: visible ? "Show layer" : "Hide layer" });
    }

    function reorderLayer(id: string, newIndex: number, skipHistory = false) {
        const index = layersOrder.value.indexOf(id);
        if (index === -1 || index === newIndex) return;

        spliceOrder(index, 1);
        spliceOrder(newIndex, 0, id);

        const obj = getObject(id);
        if (obj && state.canvas) {
            moveObjectTo(obj, newIndex);
        }

        requestRender();

        if (!skipHistory) {
            history.update((i) => reorderLayer(id, i, true), index, newIndex, {
                label: "Reorder layer",
            });
        }
    }

    return {
        selectedObject: readonly(selectedObject),
        layersList: shallowReadonly(layersList),
        history,
        init,
        requestRender,
        selectObject,
        moveObjectTo,
        setObject,
        addObject,
        removeObject,
        updateObject,
        detachObject,
        attachObject,
        undoTransform,
        addLayer,
        removeLayer,
        updateLayer,
        toggleLayerVisibility,
    };
}
