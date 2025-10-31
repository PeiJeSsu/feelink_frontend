import * as fabric from "fabric";
import { colorValues, convertToImg } from "../../../utils/BrushUtils";

class SketchyBrush extends fabric.BaseBrush {
    constructor(canvas, opt = {}) {
        super(canvas);
        
        this.canvas = canvas;
        this.width = opt.width || canvas.freeDrawingBrush?.width || 1;
        this.color = opt.color || canvas.freeDrawingBrush?.color || '#000';
        this.opacity = opt.opacity || 1;
        
        this._count = 0;
        this._points = [];
    }

    onMouseDown(pointer) {
        this._count = 0;
        this._points = [pointer];

        const ctx = this.canvas.contextTop;
        const color = colorValues(this.color);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.05 * this.opacity})`;
        ctx.lineWidth = this.width;
    }

    onMouseMove(pointer) {
        this._points.push(pointer);

        const ctx = this.canvas.contextTop;
        const points = this._points;
        const count = this._count;
        const lastPoint = points[points.length - 2];
        const factor = 0.3 * this.width;

        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();

        for (const point of points) {
            const dx = point.x - points[count].x;
            const dy = point.y - points[count].y;
            const d = dx * dx + dy * dy;

            if (d < 4000 && Math.random() > d / 2000) {
                ctx.beginPath();
                ctx.moveTo(points[count].x + (dx * factor), points[count].y + (dy * factor));
                ctx.lineTo(point.x - (dx * factor), point.y - (dy * factor));
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
        this._points = [];
        this._count = 0;
    }

}

export default SketchyBrush;