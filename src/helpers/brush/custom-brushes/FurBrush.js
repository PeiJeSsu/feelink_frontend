import * as fabric from "fabric";
import { colorValues, convertToImg } from "../../../utils/BrushUtils";

class FurBrush extends fabric.BaseBrush {
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

		ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.1 * this.opacity})`;
		ctx.lineWidth = this.width;

		this._points.push(pointer);
	}

	onMouseMove(pointer) {
		this._points.push(pointer);

		const ctx = this.canvas.contextTop;
		const points = this._points;
		const lastPoint = points[points.length - 2];

		ctx.beginPath();
		ctx.moveTo(lastPoint.x, lastPoint.y);
		ctx.lineTo(pointer.x, pointer.y);
		ctx.stroke();

		for (const point of this._points) {
			const dx = point.x - this._points[this._count].x;
			const dy = point.y - this._points[this._count].y;
			const d = dx * dx + dy * dy;

			if (d < 2000 && Math.random() > d / 2000) {
				ctx.beginPath();
				ctx.moveTo(pointer.x + dx * 0.5, pointer.y + dy * 0.5);
				ctx.lineTo(pointer.x - dx * 0.5, pointer.y - dy * 0.5);
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

export default FurBrush;
