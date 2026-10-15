const DIFF_PRIORITY: { keys: string[]; label: string }[] = [
    { label: "Edit text", keys: ["text", "styles"] },
    { label: "Rotate", keys: ["angle"] },
    { label: "Scale", keys: ["scaleX", "scaleY"] },
    { label: "Resize", keys: ["width", "height", "rx", "ry"] },
    { label: "Skew", keys: ["skewX", "skewY"] },
    { label: "Flip", keys: ["flipX", "flipY"] },
    {
        label: "Change stroke",
        keys: [
            "stroke",
            "strokeWidth",
            "strokeDashArray",
            "strokeDashOffset",
            "strokeLineCap",
            "strokeLineJoin",
            "strokeMiterLimit",
            "strokeUniform",
        ],
    },
    { label: "Change appearance", keys: ["fill", "opacity", "backgroundColor", "visible"] },
    { label: "Move", keys: ["left", "top"] },
];

export function getDiffLabel(keys: string[]): string {
    const keySet = new Set(keys);

    for (const rule of DIFF_PRIORITY) {
        for (const key of rule.keys) {
            if (keySet.has(key)) {
                return rule.label;
            }
        }
    }

    return "Update";
}
