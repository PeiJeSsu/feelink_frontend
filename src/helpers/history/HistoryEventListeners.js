import { isEraserIndicator } from "./HistoryUtils";

/**
 * 設置歷史管理器的事件監聽器
 * @param {Object} canvas - Fabric.js 畫布實例
 * @param {Function} onStateChange - 狀態變更時的回調函數
 * @param {Function} isUndoRedoing - 檢查是否正在執行復原/重做操作
 * @returns {Function} 清理函數，用於移除事件監聽器
 */
export const setupHistoryEventListeners = (canvas, onStateChange, isUndoRedoing) => {
	if (!canvas) return () => {};

	const handleObjectEvent = (e) => {
		const target = e.target || e.path;
		if (isEraserIndicator(target)) return;
		if (!isUndoRedoing()) {
			onStateChange();
		}
	};

	const handleObjectRemoved = (e) => {
		if (canvas.isClearingAll) return;
		handleObjectEvent(e);
	};

	// 註冊事件監聽器
	canvas.on("object:modified", handleObjectEvent);
	canvas.on("object:added", handleObjectEvent);
	canvas.on("object:removed", handleObjectRemoved);
	canvas.on("path:created", handleObjectEvent);

	// 返回清理函數
	return () => {
		canvas.off("object:modified", handleObjectEvent);
		canvas.off("object:added", handleObjectEvent);
		canvas.off("object:removed", handleObjectRemoved);
		canvas.off("path:created", handleObjectEvent);
	};
};
