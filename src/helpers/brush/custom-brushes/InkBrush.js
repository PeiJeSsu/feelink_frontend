import * as fabric from "fabric";
import { convertToImg, getRandom } from "../../../utils/BrushUtils";
import Stroke from "../../../utils/StrokeUtils";

class InkBrush extends fabric.BaseBrush {
	constructor(canvas, options = {}) {
		super(canvas);

		this.color = options.color || "#000";
		this.opacity = options.opacity || 1;
		this.width = options.width || 30;

		this._baseWidth = 20;
		this._inkAmount = 7;
		this._lastPoint = null;
		this._point = new fabric.Point();
		this._range = 10;
		this._strokes = null;
	}

	_render(pointer) {
		const point = this.setPointer(pointer);
		const subtractPoint = point.subtract(this._lastPoint);
		const distance = point.distanceFrom(this._lastPoint);

		for (const stroke of this._strokes) {
			stroke.update(point, subtractPoint, distance);
			stroke.draw();
		}

		if (distance > 30) {
			this.drawSplash(point, this._inkAmount);
		}
	}

	onMouseDown(pointer) {
		this.canvas.contextTop.globalAlpha = this.opacity;
		this._resetTip(pointer);
	}

	onMouseMove(pointer) {
		if (this.canvas._isCurrentlyDrawing) {
			this._render(pointer);
		}
	}

	onMouseUp() {
		convertToImg(this.canvas).then((img) => {
			img.setCoords();
			this.canvas.add(img);
			this.canvas.clearContext(this.canvas.contextTop);
			// 儲存到歷史記錄
			if (this.canvas.historyManager) {
				this.canvas.historyManager.saveState();
			}
		});
		this.canvas.contextTop.globalAlpha = 1;
	}

	drawSplash(pointer, maxSize) {
		const ctx = this.canvas.contextTop;
		const num = Math.floor(getRandom(12));
		const range = maxSize * 10;

		ctx.save();
		for (let i = 0; i < num; i++) {
			const r = getRandom(range, 1);
			const c = getRandom(Math.PI * 2);
			const point = new fabric.Point(pointer.x + r * Math.sin(c), pointer.y + r * Math.cos(c));

			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(point.x, point.y, getRandom(maxSize) / 2, 0, Math.PI * 2, false);
			ctx.fill();
		}
		ctx.restore();
	}

	setPointer(pointer) {
		const point = new fabric.Point(pointer.x, pointer.y);
		this._lastPoint = Object.assign(new fabric.Point(), this._point);
		this._point = point;
		return point;
	}

	_resetTip(pointer) {
		const point = this.setPointer(pointer);
		this._strokes = [];
		this.size = this.width / 5 + this._baseWidth;
		this._range = this.size / 2;

		for (let i = 0; i < this.size; i++) {
			this._strokes[i] = new Stroke(this.canvas.contextTop, point, this._range, this.color, this.width, this._inkAmount);
		}
	}
}

export default InkBrush;
