import * as fabric from "fabric";
import { colorValues, convertToImg } from "../../../utils/BrushUtils";

class WebBrush extends fabric.BaseBrush {
    constructor(canvas, opt = {}) {
        super(canvas);

        this.color = opt.color || canvas.freeDrawingBrush.color;
        this.width = opt.width || canvas.freeDrawingBrush.width;
        this.opacity = opt.opacity || 1;
        
        this._count = 0;
        this._points = [];
    }

    onMouseDown(pointer) {
        this._points = [pointer];
        this._count = 0;
        this._colorValues = colorValues(this.color);
    }

    onMouseMove(pointer) {
        this._points.push(pointer);

        const ctx = this.canvas.contextTop;
        const points = this._points;
        const lastPoint = points[points.length - 2];
        const colorValues = this._colorValues;

        ctx.lineWidth = this.width;
        ctx.strokeStyle = `rgba(${colorValues[0]},${colorValues[1]},${colorValues[2]},${.5 * this.opacity})`;

        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${colorValues[0]},${colorValues[1]},${colorValues[2]},${.1 * this.opacity})`;        for (const point of points) {
            const dx = point.x - points[this._count].x;
            const dy = point.y - points[this._count].y;
            const d = dx * dx + dy * dy;

            if (d < 2500 && Math.random() > .9) {
                ctx.beginPath();
                ctx.moveTo(points[this._count].x, points[this._count].y);
                ctx.lineTo(point.x, point.y);
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
    }
}

export default WebBrush;
