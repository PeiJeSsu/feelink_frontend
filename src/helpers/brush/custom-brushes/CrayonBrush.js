import * as fabric from "fabric";
import { convertToImg, getRandom, clamp } from "../../../utils/BrushUtils";

class CrayonBrush extends fabric.BaseBrush {
    constructor(canvas, options = {}) {
        super(canvas);

        this.color = options.color || "#000";
        this.opacity = options.opacity || 0.6;
        this.width = options.width || 30;

        this._baseWidth = 20;
        this._inkAmount = 10;
        this._latestStrokeLength = 0;
        this._point = new fabric.Point(0, 0);
        this._sep = 5;
        this._size = 0;
        this._latest = null;
        this._drawn = false;
    }

    onMouseDown(pointer) {
        this.canvas.contextTop.globalAlpha = this.opacity;
        this._size = this.width / 2 + this._baseWidth;
        this._drawn = false;
        this.set(pointer);
    }

    onMouseMove(pointer) {
        this.update(pointer);
        this.draw(this.canvas.contextTop);
    }

    onMouseUp() {
        if (this._drawn) {
            convertToImg(this.canvas).then((img) => {
                img.setCoords();
                this.canvas.add(img);
                this.canvas.clearContext(this.canvas.contextTop);
            });
        }
        this._latest = null;
        this._latestStrokeLength = 0;
        this.canvas.contextTop.globalAlpha = 1;
    }

    set(p) {
        if (this._latest) {
            this._latest.x = this._point.x;
            this._latest.y = this._point.y;
        } else {
            this._latest = new fabric.Point(p.x, p.y);
        }
        this._point.x = p.x;
        this._point.y = p.y;
    }

    update(p) {
        this.set(p);
        const diff = this._point.subtract(this._latest);
        this._latestStrokeLength = diff.distanceFrom(new fabric.Point(0, 0));
    }

    draw(ctx) {
        const v = this._point.subtract(this._latest);
        const s = Math.ceil(this._size / 2);
        const stepNum =
            Math.floor(v.distanceFrom(new fabric.Point(0, 0)) / s) + 1;

        // Normalize vector
        const length = v.distanceFrom(new fabric.Point(0, 0));
        if (length > 0) {
            v.x = (v.x / length) * s;
            v.y = (v.y / length) * s;
        }

        const dotSize =
            this._sep *
            clamp(
                (this._inkAmount / this._latestStrokeLength) * 3,
                1,
                0.5
            );
        const dotNum = Math.ceil(this._size * this._sep);
        const range = this._size / 2;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();

        for (let i = 0; i < dotNum; i++) {
            for (let j = 0; j < stepNum; j++) {
                const p = this._latest.add(new fabric.Point(v.x * j, v.y * j));
                const r = getRandom(range);
                const c = getRandom(Math.PI * 2);
                const w = getRandom(dotSize, dotSize / 2);
                const h = getRandom(dotSize, dotSize / 2);
                const x = p.x + r * Math.sin(c) - w / 2;
                const y = p.y + r * Math.cos(c) - h / 2;
                ctx.rect(x, y, w, h);
            }
        }

        ctx.fill();
        ctx.restore();
        this._drawn = true;
    }
}

export default CrayonBrush;
