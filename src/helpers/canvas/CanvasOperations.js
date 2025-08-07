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

export const addImageToCanvas = (canvas, imageData, options = {}) => {
	if (!canvas || !imageData) return;

	const {
		mode = 'fillViewport', // 'fillViewport' 或 'originalSize' 或 'customSize'
		targetPosition = null, // { x, y } 指定位置
		maxSize = 200, // 當mode為'originalSize'時的最大尺寸
	} = options;

	const imgObj = new Image();
	imgObj.src = imageData;
	imgObj.onload = () => {
		const fabricImage = new fabric.FabricImage(imgObj);
		let finalScale, finalLeft, finalTop;

		if (mode === 'fillViewport') {
			// 畫畫接龍模式：填滿視口，考慮當前縮放和視角
			const zoom = canvas.getZoom();
			const vpt = canvas.viewportTransform;
			
			// 計算當前可見區域
			const canvasWidth = canvas.width / zoom;
			const canvasHeight = canvas.height / zoom;
			
			// 計算縮放比例讓圖片填滿可見區域
			finalScale = Math.max(canvasWidth / fabricImage.width, canvasHeight / fabricImage.height);
			
			// 計算位置讓圖片在可見區域中央
			const viewportCenterX = -vpt[4] / zoom + canvasWidth / 2;
			const viewportCenterY = -vpt[5] / zoom + canvasHeight / 2;
			
			finalLeft = viewportCenterX - (fabricImage.width * finalScale) / 2;
			finalTop = viewportCenterY - (fabricImage.height * finalScale) / 2;
		} else if (mode === 'originalSize') {
			// 生成物件模式：保持原始比例，限制最大尺寸
			const maxDimension = Math.max(fabricImage.width, fabricImage.height);
			finalScale = maxDimension > maxSize ? maxSize / maxDimension : 1;
			
			if (targetPosition) {
				finalLeft = targetPosition.x - (fabricImage.width * finalScale) / 2;
				finalTop = targetPosition.y - (fabricImage.height * finalScale) / 2;
			} else {
				// 如果沒有指定位置，放在畫布中央
				finalLeft = (canvas.width - fabricImage.width * finalScale) / 2;
				finalTop = (canvas.height - fabricImage.height * finalScale) / 2;
			}
		}

		// 設定圖片屬性
		fabricImage.set({
			scaleX: finalScale,
			scaleY: finalScale,
			left: finalLeft,
			top: finalTop,
		});

		canvas.add(fabricImage);
		canvas.setActiveObject(fabricImage);
		canvas.renderAll();

		if (canvas.historyManager) {
			canvas.historyManager.saveState();
		}
	};
};
