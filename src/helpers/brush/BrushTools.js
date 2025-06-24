import * as fabric from "fabric";
import { convertToRGBA } from "../../helpers/color/ColorProcess";

const createPatternCanvas = (type, settings) => {
	const patternCanvas = document.createElement("canvas");
	patternCanvas.width = patternCanvas.height = 10;
	const ctx = patternCanvas.getContext("2d");
	const fillColor = convertToRGBA(settings.color, settings.opacity);

	switch (type) {
		case "PatternBrush":
			ctx.fillStyle = fillColor;
			ctx.fillRect(0, 0, 5, 5);
			ctx.fillRect(5, 5, 5, 5);
			break;
		case "VLineBrush":
		case "HLineBrush":
			ctx.strokeStyle = fillColor;
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(type === "VLineBrush" ? 0 : 5, type === "VLineBrush" ? 5 : 0);
			ctx.lineTo(type === "VLineBrush" ? 10 : 5, type === "VLineBrush" ? 5 : 10);
			ctx.closePath();
			ctx.stroke();
			break;
		default:
			break;
	}

	return patternCanvas;
};

export const createBrush = (canvas, type, settings) => {
	if (!canvas) return null;

	let brush;

	if (type === "PatternBrush" || type === "VLineBrush" || type === "HLineBrush") {
		brush = new fabric.PatternBrush(canvas);
		const patternCanvas = createPatternCanvas(type, settings);
		brush.source = patternCanvas;
	} else {
		const BrushClass = fabric[type] || fabric.PencilBrush;
		brush = new BrushClass(canvas);
	}

	if (brush) {
		brush.color = convertToRGBA(settings.color, settings.opacity);
		brush.width = parseInt(settings.size, 10) || 1;

		if (settings.shadow) {
			brush.shadow = new fabric.Shadow({
				blur: parseInt(settings.shadow.blur, 10) || 0,
				offsetX: parseInt(settings.shadow.offsetX, 10) || 0,
				offsetY: parseInt(settings.shadow.offsetY, 10) || 0,
				affectStroke: true,
				color: settings.shadow.color || "#000000",
			});
		}
	}

	return brush;
};

export const setupBrushEventListeners = (canvas, settings) => {
	canvas.off("path:created");
	canvas.on("path:created", function (e) {
		if (e.path) {
			canvas.renderAll();
			if (canvas.historyManager) {
				canvas.historyManager.saveState();
			}
		}
	});

	canvas.off("mouse:down");
	canvas.on("mouse:down", function () {
		if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
			canvas.freeDrawingBrush.color = convertToRGBA(settings.color, settings.opacity);
		}
	});
};
