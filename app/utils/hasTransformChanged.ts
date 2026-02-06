export function hasTransformChanged(a: any, b: any) {
    return a.left !== b.left || a.top !== b.top || a.scaleX !== b.scaleX || a.scaleY !== b.scaleY || a.angle !== b.angle;
}
