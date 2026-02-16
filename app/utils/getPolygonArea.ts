export function getPolygonArea(points: { x: number; y: number }[]) {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const pi = points[i];
        const pj = points[j];

        if (!pi || !pj) continue;

        area += (pj.x + pi.x) * (pj.y - pi.y);
    }

    return Math.abs(area / 2);
}
