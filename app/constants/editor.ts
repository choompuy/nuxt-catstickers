import type { Component } from "vue";
import type { CanvasModes, CanvasLayerType } from "~/types/canvas";

import Move from "~/components/icons/Move.vue";
import Grab from "~/components/icons/Grab.vue";
import Lasso from "~/components/icons/Lasso.vue";
import Rect from "~/components/icons/Rect.vue";
import Ellipse from "~/components/icons/Ellipse.vue";
import Text from "~/components/icons/Text.vue";
import Sticker from "~/components/icons/Sticker.vue";

export const TOOLS = [
    { mode: "move", icon: Move, title: "Move" },
    { mode: "panZoom", icon: Grab, title: "Pan" },
    { mode: "lasso", icon: Lasso, title: "Lasso crop" },
    { mode: "rect", icon: Rect, title: "Rect crop" },
    { mode: "ellipse", icon: Ellipse, title: "Ellipse crop" },
    { mode: "text", icon: Text, title: "Add text" },
] as const;

export const TOOL_ICON_MAP: Record<CanvasModes, Component> = {
    move: Move,
    panZoom: Grab,
    lasso: Lasso,
    rect: Rect,
    ellipse: Ellipse,
    text: Text,
};

export const LAYER_ICON_MAP: Record<CanvasLayerType, Component> = {
    path: Lasso,
    rect: Rect,
    ellipse: Ellipse,
    textbox: Text,
    image: Sticker,
};
