export function getTouchDistance(t1: Touch, t2: Touch) {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
}
