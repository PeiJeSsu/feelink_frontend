import { handleMouseDownRect, handleMouseMoveRect, isTooSmallRect } from "./RectangleShape";
import { handleMouseDownCircle, handleMouseMoveCircle, isTooSmallCircle } from "./CircleShape";
import { handleMouseDownTriangle, handleMouseMoveTriangle, isTooSmallTriangle } from "./TriangleShape";
import { handleMouseDownEllipse, handleMouseMoveEllipse, isTooSmallEllipse } from "./EllipseShape";
import { handleMouseDownLine, handleMouseMoveLine, isTooSmallLine } from "./LineShape";

export const setupShapeDrawing = (canvas, shapeSettings) => {
	let isDrawing = false;
	let startPoint = { x: 0, y: 0 };
	let currentShape = null;

	canvas.selection = false;

	canvas.on("mouse:down", function (e) {
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

	canvas.on("mouse:up", function () {
		if (isDrawing && currentShape) {
			let isTooSmall = false;

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
				canvas.remove(currentShape);
			} else {
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
				canvas.renderAll();

				if (canvas.historyManager) {
					setTimeout(() => {
						canvas.historyManager.saveState();
					}, 0);
				}
			}

			canvas.renderAll();
		}

		isDrawing = false;
		currentShape = null;
	});
};

export const disableShapeDrawing = (canvas) => {
	if (!canvas) return;

	canvas.selection = true;

	canvas.off("mouse:down");
	canvas.off("mouse:move");
	canvas.off("mouse:up");
	canvas.off("mouse:dblclick");
};
