import { Canvas, FabricImage, Point } from "fabric";

export function getCenterImage(canvas: Canvas, image: FabricImage) {
    const zoom = canvas.getZoom();

    return {
        x: (canvas.getWidth() - image.width * zoom) / 2,
        y: (canvas.getHeight() - image.height * zoom) / 2,
    };
}

export const canvasImage = {
    async loadImage(url: string): Promise<FabricImage> {
        const img = await FabricImage.fromURL(url);

        if (!img) throw new Error("Image loading returned null");

        return img;
    },

    scaleToFitImage(canvas: Canvas, image: FabricImage) {
        const scale = Math.min(canvas.getWidth() / image.width, canvas.getHeight() / image.height, 1);
        canvas.setZoom(scale);
    },

    fitContainImage(canvas: Canvas, image: FabricImage) {
        const p = getCenterImage(canvas, image);

        canvas.absolutePan(new Point(-p.x, -p.y));
        canvas.requestRenderAll();
    },
};
