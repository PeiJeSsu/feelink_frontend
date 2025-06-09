import { clearCanvas } from "../canvas/CanvasOperations";

/**
 * 從 JSON 數據加載畫布內容
 * @param {fabric.Canvas} canvas - fabric.js 畫布實例
 * @param {string} json - JSON 
 * @returns {boolean} - 加載是否成功
 */
export const loadCanvasFromJSON = (canvas, json) => {
	if (!canvas || !json) return false;

	try {
		// 清除當前畫布
		clearCanvas(canvas);

		// 解析 JSON 數據
		const data = JSON.parse(json);

		// 加載 JSON 數據
		canvas.loadFromJSON(json, () => {
			// 確保所有物件都已加載

			// 如果 JSON 中包含縮放，則應用它
			if (data.zoomLevel) {
				canvas.zoomLevel = data.zoomLevel;
			} else {
				canvas.zoomLevel = 1; // 設置默認縮放
			}

			// 如果 JSON 中包含視角變換，則應用它
			if (data.viewportTransform) {
				canvas.setViewportTransform(data.viewportTransform);
			} else {
				canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // 重置視角變換
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

/**
 * 從 .feelink 文件加載 JSON 數據
 * @param {fabric.Canvas} canvas - fabric.js 畫布實例
 * @param {File} file - 文件對象
 * @param {Function} callback - 回調函數，參數為 (success, error)
 */
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
