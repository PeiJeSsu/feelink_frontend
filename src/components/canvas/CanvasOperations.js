import * as fabric from "fabric";

// 初始化畫布
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

// 新增：設置畫布平移模式
export const setPanningMode = (canvas, isPanning) => {
	if (!canvas) return;

	// 禁用所有物件的可選擇性
	canvas.getObjects().forEach((obj) => {
		obj._originalSelectable = obj.selectable;
		obj.selectable = !isPanning;
	});

	// 禁用畫布選擇功能
	canvas.selection = !isPanning;

	// 設置畫布可拖動
	canvas.defaultCursor = isPanning ? "grab" : "default";

	// 移除現有的事件監聽器
	canvas.off("mouse:down");
	canvas.off("mouse:move");
	canvas.off("mouse:up");

	if (isPanning) {
		let isDragging = false;
		let lastPosX;
		let lastPosY;

		// 滑鼠按下事件
		canvas.on("mouse:down", function (opt) {
			const evt = opt.e;
			isDragging = true;
			canvas.defaultCursor = "grabbing";
			lastPosX = evt.clientX;
			lastPosY = evt.clientY;
		});

		// 滑鼠移動事件
		canvas.on("mouse:move", function (opt) {
			if (isDragging) {
				const evt = opt.e;
				const deltaX = evt.clientX - lastPosX;
				const deltaY = evt.clientY - lastPosY;

				// 更新畫布視口位置
				canvas.relativePan(new fabric.Point(deltaX, deltaY));

				lastPosX = evt.clientX;
				lastPosY = evt.clientY;
			}
		});

		// 滑鼠放開事件
		canvas.on("mouse:up", function () {
			isDragging = false;
			canvas.defaultCursor = "grab";
		});
	}
};

// 新增：縮放畫布
export const zoomCanvas = (canvas, zoomFactor, point) => {
	if (!canvas) return;

	// 計算新的縮放級別
	const newZoom = canvas.zoomLevel * zoomFactor;

	// 限制縮放範圍
	if (newZoom > 5 || newZoom < 0.1) return;

	// 更新畫布縮放級別
	canvas.zoomToPoint(point || new fabric.Point(canvas.width / 2, canvas.height / 2), newZoom);

	// 保存當前縮放級別
	canvas.zoomLevel = newZoom;

	return newZoom;
};

// 新增：重置畫布視圖
export const resetCanvasView = (canvas) => {
	if (!canvas) return;

	// 重置縮放
	canvas.setZoom(1);
	canvas.zoomLevel = 1;

	// 重置平移
	canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

	canvas.renderAll();

	return 1;
};

// 將畫布內容序列化為 JSON
export const serializeCanvas = (canvas) => {
	if (!canvas) return null;

	// 序列化畫布上的所有物件
	return JSON.stringify(canvas.toJSON(["id", "selectable", "evented", "_originalSelectable"]));
};

// 將 JSON 數據保存為 .feelink 文件
export const saveCanvasToFile = (canvas, fileName = "drawing.feelink") => {
	if (!canvas) return;

	const json = serializeCanvas(canvas);
	if (!json) return;

	// 創建 Blob 對象
	const blob = new Blob([json], { type: "application/json" });

	// 創建下載鏈接
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = fileName.endsWith(".feelink") ? fileName : `${fileName}.feelink`;

	// 觸發下載
	document.body.appendChild(link);
	link.click();

	// 清理
	document.body.removeChild(link);
	URL.revokeObjectURL(link.href);

	return true;
};

// 從 .feelink 文件加載 JSON 數據
export const loadCanvasFromFile = (canvas, file, callback) => {
	if (!file) {
		if (callback) callback(false, new Error("未選擇文件"));
		return;
	}

	// 檢查畫布是否已初始化
	if (!canvas) {
		// 如果畫布未初始化，等待一段時間後重試
		console.log("畫布未初始化，等待後重試...");
		setTimeout(() => {
			loadCanvasFromFile(canvas, file, callback);
		}, 500);
		return;
	}

	const reader = new FileReader();

	reader.onload = (e) => {
		try {
			const json = e.target.result;
			const success = loadCanvasFromJSON(canvas, json);

			if (success) {
				// 強制重新渲染畫布
				setTimeout(() => {
					canvas.requestRenderAll();
				}, 100);
			}

			if (callback && typeof callback === "function") {
				callback(success);
			}
		} catch (error) {
			console.error("加載畫布失敗:", error);
			if (callback && typeof callback === "function") {
				callback(false, error);
			}
		}
	};

	reader.onerror = (error) => {
		console.error("讀取文件失敗:", error);
		if (callback && typeof callback === "function") {
			callback(false, error);
		}
	};

	reader.readAsText(file);
};

// 從 JSON 數據加載畫布內容
export const loadCanvasFromJSON = (canvas, json) => {
	if (!canvas || !json) return false;

	try {
		// 清除當前畫布
		canvas.clear();

		// 解析 JSON 數據
		const data = JSON.parse(json);

		// 加載 JSON 數據
		canvas.loadFromJSON(json, () => {
			// 確保所有物件都已加載

			// 如果 JSON 中包含縮放級別，則應用它
			if (data.zoomLevel) {
				canvas.zoomLevel = data.zoomLevel;
			} else {
				canvas.zoomLevel = 1; // 設置默認縮放級別
			}

			// 如果 JSON 中包含視口變換，則應用它
			if (data.viewportTransform) {
				canvas.setViewportTransform(data.viewportTransform);
			} else {
				canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // 重置視口變換
			}

			// 確保所有物件可選
			canvas.getObjects().forEach((obj) => {
				obj.selectable = true;
				obj.evented = true;
			});

			// 啟用畫布選擇
			canvas.selection = true;

			// 強制重新渲染
			canvas.requestRenderAll();
		});

		return true;
	} catch (error) {
		console.error("加載畫布失敗:", error);
		return false;
	}
};
