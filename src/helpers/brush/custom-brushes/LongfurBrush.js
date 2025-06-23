import * as fabric from "fabric";
import { colorValues, convertToImg } from "../../../utils/BrushUtils";

class LongfurBrush extends fabric.BaseBrush {
    constructor(canvas, options = {}) {
        super(canvas);

        this.color = options.color || "#000";
        this.opacity = options.opacity || 1;
        this.width = options.width || canvas.freeDrawingBrush?.width || 1;

        this._count = 0;
        this._points = [];
    }

    onMouseDown(pointer) {
        this._points = [pointer];
        this._count = 0;

        const color = colorValues(this.color);
        const ctx = this.canvas.contextTop;

        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.05 * this.opacity})`;
        ctx.lineWidth = this.width;
    }

    onMouseMove(pointer) {
        this._points.push(pointer);

        const ctx = this.canvas.contextTop;

        for (const point of this._points) {
            const size = -Math.random();

            const dx = point.x - this._points[this._count].x;
            const dy = point.y - this._points[this._count].y;
            const d = dx * dx + dy * dy;

            if (d < 4000 && Math.random() > d / 4000) {
                ctx.beginPath();
                ctx.moveTo(
                    this._points[this._count].x + (dx * size),
                    this._points[this._count].y + (dy * size)
                );
                ctx.lineTo(
                    point.x - (dx * size) + Math.random() * 2,
                    point.y - (dy * size) + Math.random() * 2
                );
                ctx.stroke();
            }
        }

        this._count++;
    }

    onMouseUp() {
        if (this._count > 0) {
            convertToImg(this.canvas).then((img) => {
                img.setCoords();
                this.canvas.add(img);
                this.canvas.clearContext(this.canvas.contextTop);
            });
        }
        this._count = 0;
        this._points = [];
    }
}

export default LongfurBrush;
