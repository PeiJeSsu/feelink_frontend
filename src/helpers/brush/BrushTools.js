import * as fabric from "fabric";
import { convertToRGBA } from "../../helpers/color/ColorProcess";
import MarkerBrush from "./custom-brushes/MarkerBrush";
import ShadedBrush from "./custom-brushes/ShadedBrush";
import RibbonBrush from "./custom-brushes/RibbonBrush";
import LongfurBrush from "./custom-brushes/LongfurBrush";
import InkBrush from "./custom-brushes/InkBrush";
import FurBrush from "./custom-brushes/FurBrush";
import CrayonBrush from "./custom-brushes/CrayonBrush";
import SketchyBrush from "./custom-brushes/SketchyBrush";
import WebBrush from "./custom-brushes/WebBrush";
import SquaresBrush from "./custom-brushes/SquaresBrush";
import SpraypaintBrush from "./custom-brushes/SpraypaintBrush";

// 自定義筆刷映射
const customBrushes = {
	MarkerBrush,
	ShadedBrush,
	RibbonBrush,
	LongfurBrush,
	InkBrush,
	FurBrush,
	CrayonBrush,
	SketchyBrush,
	WebBrush,
	SquaresBrush,
	SpraypaintBrush,
};

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
		case "SquareBrush": {
			const squareWidth = 10,
				squareDistance = 2;
			patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
			ctx.fillStyle = fillColor;
			ctx.fillRect(0, 0, squareWidth, squareWidth);
			break;
		}
		case "DiamondBrush": {
			const squareWidth = 10;
			const squareDistance = 5;
			const rect = new fabric.Rect({
				width: squareWidth,
				height: squareWidth,
				angle: 45,
				fill: fillColor,
			});

			const canvasWidth = rect.getBoundingRect().width;
			patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;

			rect.set({
				left: canvasWidth / 2,
				top: canvasWidth / 2,
			});

			rect.render(ctx);
			break;
		}
		default:
			break;
	}

	return patternCanvas;
};

export const createBrush = (canvas, type, settings) => {
	if (!canvas) return null;

	let brush;

	if (
		type === "PatternBrush" ||
		type === "VLineBrush" ||
		type === "HLineBrush" ||
		type === "SquareBrush" ||
		type === "DiamondBrush"
	) {
		brush = new fabric.PatternBrush(canvas);
		const patternCanvas = createPatternCanvas(type, settings);
		brush.source = patternCanvas;
	} else if (type === "CircleBrush") {
		brush = new fabric.CircleBrush(canvas);
	} else if (type === "SprayBrush") {
		brush = new fabric.SprayBrush(canvas);
		brush.density = 30;
		brush.dotWidth = settings.size / 20;
		brush.randomOpacity = true;
		brush.dotWidthVariance = 1;
	} else if (Object.hasOwn(customBrushes, type)) {
		const CustomBrush = customBrushes[type];
		brush = new CustomBrush(canvas);
	} else {
		brush = new fabric.PencilBrush(canvas);
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
