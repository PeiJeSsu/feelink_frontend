import * as fabric from "fabric";

/**
 * 將畫布內容序列化為 JSON
 * @param {fabric.Canvas} canvas - fabric.js 畫布實例
 * @returns {string|null} - 序列化後的 JSON 字符串
 */
export const serializeCanvas = (canvas) => {
	if (!canvas) return null;

	// 序列化畫布上的所有物件，包括自定義屬性
	return JSON.stringify(canvas.toJSON(["id", "selectable", "evented", "_originalSelectable"]));
};

/**
 * 將 JSON 數據保存為 .feelink 文件
 * @param {fabric.Canvas} canvas - fabric.js 畫布實例
 * @param {string} fileName - 文件名
 * @returns {boolean} - 保存是否成功
 */
export const saveCanvasToFile = (canvas, fileName = "drawing.feelink") => {
	if (!canvas) return false;

	const json = serializeCanvas(canvas);
	if (!json) return false;

	try {
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
	} catch (error) {
		console.error("保存文件失敗:", error);
		return false;
	}
};

/**
 * 從 JSON 數據加載畫布內容
 * @param {fabric.Canvas} canvas - fabric.js 畫布實例
 * @param {string} json - JSON 字符串
 * @returns {boolean} - 加載是否成功
 */
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

/**
 * 顯示文件加載中提示
 * @returns {HTMLElement} - 提示元素
 */
export const showLoadingMessage = (message = "正在加載文件...") => {
	const loadingMessage = document.createElement("div");
	loadingMessage.style.position = "fixed";
	loadingMessage.style.top = "50%";
	loadingMessage.style.left = "50%";
	loadingMessage.style.transform = "translate(-50%, -50%)";
	loadingMessage.style.padding = "20px";
	loadingMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
	loadingMessage.style.color = "white";
	loadingMessage.style.borderRadius = "8px";
	loadingMessage.style.zIndex = "9999";
	loadingMessage.textContent = message;
	document.body.appendChild(loadingMessage);

	return loadingMessage;
};

/**
 * 隱藏文件加載中提示
 * @param {HTMLElement} loadingMessage - 提示元素
 */
export const hideLoadingMessage = (loadingMessage) => {
	loadingMessage?.parentNode?.removeChild(loadingMessage);
};

// 新增這些處理函數
export const handleSaveFile = (canvas) => {
	if (!canvas) {
		console.error("畫布未初始化");
		return;
	}

	const fileName = prompt("請輸入保存的文件名:", "drawing.feelink");
	if (!fileName) return;

	const success = saveCanvasToFile(canvas, fileName);
	if (success) {
		alert("檔案保存成功！");
	} else {
		alert("檔案保存失敗，請重試。");
	}
};

export const handleLoadFile = (fileInputRef, canvasReady) => {
	if (!canvasReady) {
		alert("畫布尚未準備好，請稍後再試");
		return;
	}
	fileInputRef.current.click();
};

export const handleFileInputChange = (event, canvas, canvasReady) => {
	const file = event.target.files[0];
	if (!file) return;

	// 保存 loading message 的引用
	const loadingMessage = showLoadingMessage();

	loadCanvasFromFile(canvas, file, (success, error) => {
		// 確保一定會移除 loading message
		hideLoadingMessage(loadingMessage); // 修改：傳入 loadingMessage 參考

		if (success) {
			alert("檔案載入成功！");
		} else {
			alert(`檔案載入失敗：${error?.message || "未知錯誤"}`);
		}
	});

	event.target.value = "";
};
