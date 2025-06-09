import * as fabric from "fabric";
import { getRandom } from "./BrushUtils";

class Stroke {
    constructor(ctx, pointer, range, color, lineWidth, inkAmount) {
        const rx = getRandom(range);
        const c = getRandom(Math.PI * 2);
        const c0 = getRandom(Math.PI * 2);
        const x0 = rx * Math.sin(c0);
        const y0 = (rx / 2) * Math.cos(c0);
        const cos = Math.cos(c);
        const sin = Math.sin(c);

        this.ctx = ctx;
        this.color = color;
        this._point = new fabric.Point(
            pointer.x + x0 * cos - y0 * sin,
            pointer.y + x0 * sin + y0 * cos
        );
        this.lineWidth = lineWidth;
        this.inkAmount = inkAmount;
        this._currentLineWidth = lineWidth;
        this._lastPoint = null;

        ctx.lineCap = 'round';
    }

    update(pointer, subtractPoint, distance) {
        this._lastPoint = Object.assign(new fabric.Point(), this._point);
        this._point.addEquals({ x: subtractPoint.x, y: subtractPoint.y });

        const n = this.inkAmount / (distance + 1);
        let per;
        if (n > 0.3) {
            per = 0.2;
        } else {
            per = n < 0 ? 0 : n;
        }
        this._currentLineWidth = this.lineWidth * per;
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();
        this.line(ctx, this._lastPoint, this._point, this.color, this._currentLineWidth);
        ctx.restore();
    }

    line(ctx, point1, point2, color, lineWidth) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
    }
}

export default Stroke;
