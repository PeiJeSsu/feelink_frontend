import * as fabric from "fabric";
import { convertToImg } from "../../../utils/BrushUtils";

class MarkerBrush extends fabric.BaseBrush {
    constructor(canvas, options = {}) {
        super(canvas);

        this.color = options.color || "#000";
        this.opacity = options.opacity || 1;
        this.width = options.width || 30;

        this._baseWidth = 10;
        this._lastPoint = null;
        this._lineWidth = 3;
        this._point = new fabric.Point();
        this._size = 0;

        // 設置 canvas context 的屬性
        this.canvas.contextTop.globalAlpha = this.opacity;
        this.canvas.contextTop.lineJoin = 'round';
        this.canvas.contextTop.lineCap = 'round';
    }

    _render(pointer) {
        const ctx = this.canvas.contextTop;
        const len = (this._size / this._lineWidth) / 2;

        ctx.beginPath();

        for (let i = 0; i < len; i++) {
            const lineWidthDiff = (this._lineWidth - 1) * i;

            ctx.globalAlpha = 0.8 * this.opacity;
            ctx.moveTo(
                this._lastPoint.x + lineWidthDiff,
                this._lastPoint.y + lineWidthDiff
            );
            ctx.lineTo(
                pointer.x + lineWidthDiff,
                pointer.y + lineWidthDiff
            );
            ctx.stroke();
        }

        this._lastPoint = new fabric.Point(pointer.x, pointer.y);
    }

    onMouseDown(pointer) {
        this._lastPoint = pointer;
        this.canvas.contextTop.strokeStyle = this.color;
        this.canvas.contextTop.lineWidth = this._lineWidth;
        this._size = this.width + this._baseWidth;
    }

    onMouseMove(pointer) {
        if (this.canvas._isCurrentlyDrawing) {
            this._render(pointer);
        }
    }

    onMouseUp() {
        this.canvas.contextTop.globalAlpha = this.opacity;
        this.canvas.contextTop.globalAlpha = 1;
        convertToImg(this.canvas).then((img) => {
            img.setCoords();
            this.canvas.add(img);
            this.canvas.clearContext(this.canvas.contextTop);
        });
    }
}

export default MarkerBrush;
