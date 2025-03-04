import { handleMouseDownRect, handleMouseMoveRect, isTooSmallRect } from "./RectangleShape";
import { handleMouseDownCircle, handleMouseMoveCircle, isTooSmallCircle } from "./CircleShape";
import {
	handleMouseDownTriangle,
	handleMouseMoveTriangle,
	isTooSmallTriangle,
} from "./TriangleShape";
import { handleMouseDownEllipse, handleMouseMoveEllipse, isTooSmallEllipse } from "./EllipseShape";
import { handleMouseDownLine, handleMouseMoveLine, isTooSmallLine } from "./LineShape";

export const setupShapeDrawing = (canvas, shapeSettings) => {
	let isDrawing = false;
	let startPoint = { x: 0, y: 0 };
	let currentShape = null;

	canvas.selection = false;

	canvas.off("mouse:down");
	canvas.off("mouse:move");
	canvas.off("mouse:up");
	canvas.off("mouse:dblclick");

	// 鼠標按下事件
	canvas.on("mouse:down", function (e) {
		// 檢查點擊處是否已有物件，如果有則不啟動繪圖模式
		if (e.target) {
			isDrawing = false;
			return;
		}

		isDrawing = true;
		startPoint = canvas.getPointer(e.e);

		switch (shapeSettings.type) {
			case "RECT":
				currentShape = handleMouseDownRect(e, canvas, shapeSettings);
				break;
			case "CIRCLE":
				currentShape = handleMouseDownCircle(e, canvas, shapeSettings);
				break;
			case "TRIANGLE":
				currentShape = handleMouseDownTriangle(e, canvas, shapeSettings);
				break;
			case "ELLIPSE":
				currentShape = handleMouseDownEllipse(e, canvas, shapeSettings);
				break;
			case "LINE":
				currentShape = handleMouseDownLine(e, canvas, shapeSettings);
				break;
			default:
				break;
		}
	});

	// 鼠標移動事件
	canvas.on("mouse:move", function (e) {
		if (!isDrawing) return;

		switch (shapeSettings.type) {
			case "RECT":
				handleMouseMoveRect(e, canvas, currentShape, startPoint);
				break;
			case "CIRCLE":
				handleMouseMoveCircle(e, canvas, currentShape, startPoint);
				break;
			case "TRIANGLE":
				handleMouseMoveTriangle(e, canvas, currentShape, startPoint);
				break;
			case "ELLIPSE":
				handleMouseMoveEllipse(e, canvas, currentShape, startPoint);
				break;
			case "LINE":
				handleMouseMoveLine(e, canvas, currentShape);
				break;
			default:
				break;
		}
	});

	// 鼠標釋放事件
	canvas.on("mouse:up", function () {
		// 完成繪製後檢查圖形尺寸
		if (isDrawing && currentShape) {
			// 檢查圖形是否太小（單點擊情況）
			let isTooSmall = false;

			// 根據不同圖形類型檢查尺寸
			switch (shapeSettings.type) {
				case "RECT":
					isTooSmall = isTooSmallRect(currentShape);
					break;
				case "CIRCLE":
					isTooSmall = isTooSmallCircle(currentShape);
					break;
				case "TRIANGLE":
					isTooSmall = isTooSmallTriangle(currentShape);
					break;
				case "ELLIPSE":
					isTooSmall = isTooSmallEllipse(currentShape);
					break;
				case "LINE":
					isTooSmall = isTooSmallLine(currentShape);
					break;
				default:
					break;
			}

			if (isTooSmall) {
				// 如果太小，從畫布中移除
				canvas.remove(currentShape);
			} else {
				// 尺寸足夠，啟用選擇和控制功能
				currentShape.set({
					selectable: true,
					hasControls: true,
					hasBorders: true,
					lockRotation: false,
					transparentCorners: false,
					cornerColor: "rgba(102,153,255,0.8)",
					cornerSize: 8,
				});
				canvas.setActiveObject(currentShape);
			}

			canvas.renderAll();
		}

		isDrawing = false;
		currentShape = null;
	});
};

// 停用圖形繪製
export const disableShapeDrawing = (canvas) => {
	// 恢復選取功能
	canvas.selection = true;

	canvas.off("mouse:down");
	canvas.off("mouse:move");
	canvas.off("mouse:up");
	canvas.off("mouse:dblclick");
};
