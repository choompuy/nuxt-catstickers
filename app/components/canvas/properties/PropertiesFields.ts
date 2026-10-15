import type { Component } from "vue";
import Angle from "~/components/icons/Angle.vue";
import type { CanvasObjectStateKeys } from "~/types/canvasObject";

interface PropertiesFields {
    label: string;
    fields: FieldSchema[];
}

export interface FieldSchema<K extends CanvasObjectStateKeys = CanvasObjectStateKeys> {
    key: K;
    type: "number" | "text" | "color" | "checkbox";
    label?: string;
    min?: number;
    max?: number;
    icon?: Component | string;
    suffix?: string;
    format?: (value: any) => any;
    parse?: (value: any) => any;
}

export const LAYOUT_FIELDS: PropertiesFields = {
    label: "Layout",
    fields: [
        { key: "left", type: "number", icon: "X" },
        { key: "top", type: "number", icon: "Y" },
        { key: "width", type: "number", icon: "W" },
        { key: "height", type: "number", icon: "H" },
        {
            key: "angle",
            type: "number",
            icon: Angle,
            suffix: "°",
            parse: (v: number) => ((v % 360) + 360) % 360,
        },
        { key: "scaleX", type: "number", icon: "S" },
        { key: "scaleY", type: "number", icon: "S" },
    ],
};

export const APPEARANCE_FIELDS: PropertiesFields = {
    label: "Appearance",
    fields: [
        { key: "fill", type: "color", icon: "F" },
        { key: "backgroundColor", type: "color", icon: "B" },
        { key: "stroke", type: "color", icon: "S" },
        { key: "strokeWidth", type: "number", min: 0, icon: "W" },
        {
            key: "opacity",
            type: "number",
            min: 0,
            max: 100,
            icon: "o",
            suffix: "%",
            format: (v: number) => Math.round(v * 100),
            parse: (v: number) => Math.round(v) / 100,
        },
        { key: "visible", type: "checkbox" },
    ],
};

export const TYPOGRAPHY_FIELDS: PropertiesFields = {
    label: "Typography",
    fields: [
        { key: "fontSize", type: "number", icon: "S" },
        { key: "fontWeight", type: "text", icon: "W" },
        { key: "fontFamily", type: "text", icon: "F" },
        { key: "textAlign", type: "text", icon: "A" },
        { key: "lineHeight", type: "number", icon: "H" },
        { key: "charSpacing", type: "number", icon: "S" },
    ],
};

export const SHAPE_FIELDS = {
    label: "Shape",
    fields: ["rx", "ry", "path"],
};

export const IMAGE_FIELDS = {
    label: "Image",
    fields: ["src", "cropX", "cropY"],
};

export const EFFECTS_FIELDS = {
    label: "Effects",
    fields: ["shadow"],
};
