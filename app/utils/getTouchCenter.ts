import { Point } from "fabric";

export function getTouchCenter(t1: Touch, t2?: Touch) {
    if (!t2) return new Point(t1.clientX, t1.clientY);
    return new Point((t1.clientX + t2.clientX) / 2, (t1.clientY + t2.clientY) / 2);
}
