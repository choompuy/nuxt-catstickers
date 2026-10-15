const DIFF_RULES = [
    { label: "Edit text", keys: ["text", "styles"] },
    {
        label: "Text style",
        keys: [
            "fontSize",
            "fontFamily",
            "fontWeight",
            "fontStyle",
            "textAlign",
            "lineHeight",
            "charSpacing",
            "textBackgroundColor",
            "underline",
            "linethrough",
            "overline",
        ],
    },
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
            "strokeDashOffset",
            "strokeLineCap",
            "strokeLineJoin",
            "strokeMiterLimit",
            "strokeUniform",
        ],
    },
    {
        label: "Change appearance",
        keys: [
            "fill",
            "opacity",
            "backgroundColor",
            "visible",
            "shadow",
            "globalCompositeOperation",
        ],
    },
    { label: "Move", keys: ["left", "top"] },
    { label: "Update", keys: [] },
] as const;

function isEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((v, i) => isEqual(v, b[i]));
    }

    if (a && b && typeof a === "object" && typeof b === "object") {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) return false;

        return aKeys.every((k) => isEqual(a[k], b[k]));
    }

    return false;
}

export function getCanvasObjectDiff(prev: any, next: any): string | null {
    let hasAnyChange = false;

    for (const rule of DIFF_RULES) {
        for (const key of rule.keys) {
            if (!isEqual(prev[key], next[key])) {
                return rule.label;
            }
        }
    }

    for (const key in next) {
        if (!isEqual(prev[key], next[key])) {
            hasAnyChange = true;
            break;
        }
    }

    return hasAnyChange ? "Update" : null;
}
