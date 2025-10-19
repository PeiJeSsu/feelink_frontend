import * as fabric from "fabric";
import { colorValues, convertToImg } from "../../../utils/BrushUtils";

class ShadedBrush extends fabric.BaseBrush {
    constructor(canvas, options = {}) {
        super(canvas);

        this.color = options.color || "#000";
        this.opacity = options.opacity || 0.3;
        this.width = options.width || canvas.freeDrawingBrush?.width || 1;
        this.shadeDistance = options.shadeDistance || 1000;

        this._points = [];
    }

    onMouseDown(pointer) {
        this._points = [pointer];

        const color = colorValues(this.color);
        const ctx = this.canvas.contextTop;

        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${this.opacity})`;
        ctx.lineWidth = this.width;
        ctx.lineJoin = ctx.lineCap = 'round';
    }

    onMouseMove(pointer) {
        this._points.push(pointer);

        const ctx = this.canvas.contextTop;
        const points = this._points;
        const currentPoint = points[points.length - 1];
        const previousPoint = points[points.length - 2];

        // 繪製主要線條
        ctx.beginPath();
        ctx.moveTo(previousPoint.x, previousPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();        // 繪製陰影效果
        for (const point of points) {
            const dx = point.x - currentPoint.x;
            const dy = point.y - currentPoint.y;
            const d = dx * dx + dy * dy;

            if (d < this.shadeDistance) {
                ctx.beginPath();
                ctx.moveTo(
                    currentPoint.x + (dx * 0.2),
                    currentPoint.y + (dy * 0.2)
                );
                ctx.lineTo(
                    point.x - (dx * 0.2),
                    point.y - (dy * 0.2)
                );
                ctx.stroke();
            }
        }
    }

    onMouseUp() {
        if (this._points.length > 1) {
            convertToImg(this.canvas).then((img) => {
                img.setCoords();
                this.canvas.add(img);
                this.canvas.clearContext(this.canvas.contextTop);
                // 儲存到歷史記錄
                if (this.canvas.historyManager) {
                    this.canvas.historyManager.saveState();
                }
            });
        }
        this._points = [];
    }
}

export default ShadedBrush;
