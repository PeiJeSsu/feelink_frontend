import * as fabric from "fabric";

export const initializeCanvas = (canvasRef, width, height) => {
	// 確保寬度和高度有效
	width = width || window.innerWidth - 60;
	height = height || window.innerHeight;

	const canvas = new fabric.Canvas(canvasRef, {
		width,
		height,
		backgroundColor: "#ffffff",
		isDrawingMode: false,
		renderOnAddRemove: true, // 確保添加/移除物件時自動渲染
		stateful: true, // 確保狀態更新時自動渲染
	});

	fabric.FabricObject.prototype.transparentCorners = false;

	// 初始化縮放比例
	canvas.zoomLevel = 1;

	// 強制立即渲染
	canvas.renderAll();

	return canvas;
};

export const clearCanvas = (canvas) => {
	if (!canvas) return;

	canvas.clear();
	canvas.backgroundColor = "#ffffff";
	canvas.renderAll();
};

export const resizeCanvas = (canvas, width, height) => {
	if (!canvas) return;

	canvas.setDimensions({
		width,
		height,
	});
};

export const setDrawingMode = (canvas, isDrawingMode) => {
	if (!canvas) return;

	canvas.isDrawingMode = isDrawingMode;
};
