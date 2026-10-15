export function hasTransformChanged(a: unknown, b: unknown) {
    const aTransform = a as {
        left: number;
        top: number;
        scaleX: number;
        scaleY: number;
        angle: number;
    };
    const bTransform = b as {
        left: number;
        top: number;
        scaleX: number;
        scaleY: number;
        angle: number;
    };
    return (
        aTransform.left !== bTransform.left ||
        aTransform.top !== bTransform.top ||
        aTransform.scaleX !== bTransform.scaleX ||
        aTransform.scaleY !== bTransform.scaleY ||
        aTransform.angle !== bTransform.angle
    );
}
