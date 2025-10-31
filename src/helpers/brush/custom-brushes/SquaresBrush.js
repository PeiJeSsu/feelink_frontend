import * as fabric from "fabric";
import { colorValues, convertToImg } from "../../../utils/BrushUtils";

class SquaresBrush extends fabric.BaseBrush {
	constructor(canvas, opt = {}) {
		super(canvas);

		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.bgColor = opt.bgColor || "#fff";
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;

		this._lastPoint = null;
		this._drawn = false;
	}

	onMouseDown(pointer) {
		const ctx = this.canvas.contextTop;
		const color = colorValues(this.color);
		const bgColor = colorValues(this.bgColor);

		this._lastPoint = pointer;
		this._drawn = false;

		this.canvas.contextTop.globalAlpha = this.opacity;
		ctx.fillStyle = `rgba(${bgColor[0]},${bgColor[1]},${bgColor[2]},${bgColor[3]})`;
		ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
		ctx.lineWidth = this.width;
	}

	onMouseMove(pointer) {
		if (!this._lastPoint) return;
		const ctx = this.canvas.contextTop;
		const dx = pointer.x - this._lastPoint.x;
		const dy = pointer.y - this._lastPoint.y;
		const angle = 1.57079633; // ~90 degrees in radians
		const px = Math.cos(angle) * dx - Math.sin(angle) * dy;
		const py = Math.sin(angle) * dx + Math.cos(angle) * dy;

		ctx.beginPath();
		ctx.moveTo(this._lastPoint.x - px, this._lastPoint.y - py);
		ctx.lineTo(this._lastPoint.x + px, this._lastPoint.y + py);
		ctx.lineTo(pointer.x + px, pointer.y + py);
		ctx.lineTo(pointer.x - px, pointer.y - py);
		ctx.lineTo(this._lastPoint.x - px, this._lastPoint.y - py);
		ctx.fill();
		ctx.stroke();

		this._lastPoint = pointer;
		this._drawn = true;
	}

	onMouseUp() {
		if (this._drawn) {
			convertToImg(this.canvas)
				.then((img) => {
					img.setCoords();
					this.canvas.add(img);
					this.canvas.clearContext(this.canvas.contextTop);
				})
				.catch(() => {});
		}
		this.canvas.contextTop.globalAlpha = 1;
	}
}

export default SquaresBrush;
