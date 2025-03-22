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
