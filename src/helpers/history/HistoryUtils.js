/**
 * 檢查物件是否為橡皮擦指示器
 * @param {Object} obj - 要檢查的物件
 * @returns {boolean} 是否為橡皮擦指示器
 */
export const isEraserIndicator = (obj) => {
	return obj && obj.type === "circle" && obj.fill === "rgba(255, 0, 0, 0.3)";
};

/**
 * 序列化畫布狀態
 * @param {Object} canvas - Fabric.js 畫布實例
 * @returns {string} 序列化後的狀態字串
 */
export const serializeCanvasState = (canvas) => {
	if (!canvas) return null;

	// 在保存前過濾掉所有橡皮擦指示器
	const objectsToSave = canvas.getObjects().filter((obj) => !isEraserIndicator(obj));

	// 暫時保存原始物件列表
	const originalObjects = [...canvas._objects];

	// 設置一個只包含要保存物件的臨時列表
	canvas._objects = objectsToSave;

	// 保存畫布狀態（不包含指示器）
	const jsonState = JSON.stringify(canvas.toJSON(["selectable", "erasable", "evented", "_originalSelectable"]));

	// 恢復原始物件列表
	canvas._objects = originalObjects;

	return jsonState;
};

/**
 * 反序列化並加載畫布狀態
 * @param {Object} canvas - Fabric.js 畫布實例
 * @param {string} jsonState - 序列化的狀態字串
 * @returns {Promise<void>}
 */
export const deserializeCanvasState = async (canvas, jsonState) => {
	if (!canvas || !jsonState) return;

	const currentViewport = canvas.viewportTransform;
	const currentZoom = canvas.getZoom();

	canvas.clear();

	try {
		const state = JSON.parse(jsonState);

		await new Promise((resolve, reject) => {
			canvas.loadFromJSON(state, () => {
				if (currentViewport) {
					canvas.setViewportTransform(currentViewport);
				}
				if (currentZoom) {
					canvas.setZoom(currentZoom);
				}

				canvas.getObjects().forEach((obj) => {
					if (obj.erasable !== undefined) {
						obj.set("erasable", true);
					}
					obj.setCoords();
				});

				canvas.requestRenderAll();
				resolve();
			});
		});
	} catch (error) {
		console.error("Error loading canvas state:", error);
		throw error;
	}
};
