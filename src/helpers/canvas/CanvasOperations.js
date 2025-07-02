import * as fabric from "fabric";

export const initializeCanvas = (canvasRef, width, height) => {
	width = width || window.innerWidth - 60;
	height = height || window.innerHeight;

	const canvas = new fabric.Canvas(canvasRef, {
		width,
		height,
		backgroundColor: "#ffffff",
		isDrawingMode: false,
		renderOnAddRemove: true, // 確保添加/移除物件時自動渲染
		stateful: true, // 確保狀態更新時自動渲染
		enableRetinaScaling: true, // 啟用高解析度螢幕支援
	});

	fabric.FabricObject.prototype.transparentCorners = false;

	// 初始化縮放比例
	canvas.zoomLevel = 1;

	canvas.renderAll();

	return canvas;
};

export const clearCanvas = (canvas) => {
	if (!canvas) return;

	// 加入標誌來告知 HistoryManager 這是一次整體清除操作
	canvas.isClearingAll = true;

	canvas.clear();
	canvas.backgroundColor = "#ffffff"; 
	canvas.isClearingAll = false;

	canvas.renderAll();

	// 在清空畫布後，手動儲存空白狀態到歷史記錄
	if (canvas.historyManager) {
		canvas.historyManager.saveState();
	}
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

export const addImageToCanvas = (canvas, imageData) => {
	if (!canvas || !imageData) return;

	const imgObj = new Image();
	imgObj.src = imageData;
	imgObj.onload = () => {
		const fabricImage = new fabric.FabricImage(imgObj);

		// 取得視窗大小
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// 計算縮放比例，讓圖片填滿視窗
		const scale = Math.max(
			windowWidth / fabricImage.width,
			windowHeight / fabricImage.height
		);

		// 設定圖片屬性
		fabricImage.set({
			scaleX: scale,
			scaleY: scale,
			left: (windowWidth - fabricImage.width * scale) / 2,
			top: (windowHeight - fabricImage.height * scale) / 2,
		});

		canvas.add(fabricImage);
		canvas.setActiveObject(fabricImage);
		canvas.renderAll();

		if (canvas.historyManager) {
			canvas.historyManager.saveState();
		}
	};
};
