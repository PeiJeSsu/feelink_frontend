/**
 * 畫布縮放相關功能
 */

// 縮放常數
export const ZOOM_INCREMENT = 0.1; // 10% 縮放增量
export const MIN_ZOOM = 0.1; // 最小縮放比例 10%
export const MAX_ZOOM = 5; // 最大縮放比例 500%

/**
 * 處理滾輪縮放
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {Object} opt - 滾輪事件參數
 */
export const handleWheelZoom = (canvas, opt) => {
	if (!canvas) return;

	const delta = opt.e.deltaY;
	let zoom = canvas.getZoom();

	// 計算新的縮放級別，以 10% 為增量
	zoom =
		delta > 0
			? Math.max(MIN_ZOOM, Math.round((zoom - ZOOM_INCREMENT) * 10) / 10)
			: Math.min(MAX_ZOOM, Math.round((zoom + ZOOM_INCREMENT) * 10) / 10);

	// 如果縮放級別沒有變化，退出
	if (zoom === canvas.getZoom()) return;

	const point = {
		x: opt.e.offsetX,
		y: opt.e.offsetY,
	};

	canvas.zoomToPoint(point, zoom);
	canvas.zoomLevel = zoom;
	opt.e.preventDefault();
	opt.e.stopPropagation();

	return zoom;
};

/**
 * 放大畫布
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {number} currentZoom - 當前縮放級別
 * @returns {number} 新的縮放級別
 */
export const zoomIn = (canvas, currentZoom) => {
	if (!canvas) return currentZoom;

	const newZoomLevel = Math.min(Math.round((currentZoom + ZOOM_INCREMENT) * 10) / 10, MAX_ZOOM);
	canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoomLevel);
	canvas.zoomLevel = newZoomLevel;
	canvas.renderAll();

	return newZoomLevel;
};

/**
 * 縮小畫布
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {number} currentZoom - 當前縮放級別
 * @returns {number} 新的縮放級別
 */
export const zoomOut = (canvas, currentZoom) => {
	if (!canvas) return currentZoom;

	const newZoomLevel = Math.max(Math.round((currentZoom - ZOOM_INCREMENT) * 10) / 10, MIN_ZOOM);
	canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoomLevel);
	canvas.zoomLevel = newZoomLevel;
	canvas.renderAll();

	return newZoomLevel;
};

/**
 * 設置特定縮放級別
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {number} zoomLevel - 目標縮放級別
 * @returns {number} 實際應用的縮放級別
 */
export const setZoomLevel = (canvas, zoomLevel) => {
	if (!canvas) return zoomLevel;

	// 確保值是10%的倍數
	const roundedValue = Math.round(zoomLevel * 10) / 10;
	const clampedValue = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, roundedValue));

	canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, clampedValue);
	canvas.zoomLevel = clampedValue;
	canvas.renderAll();

	return clampedValue;
};

/**
 * 重置畫布視圖
 * @param {Object} canvas - fabric.js 畫布實例
 */
export const resetCanvasView = (canvas) => {
	if (!canvas) return;

	// 重置縮放級別為 1
	canvas.setZoom(1);
	canvas.zoomLevel = 1;

	// 重置視口變換為默認值
	canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

	// 重新渲染畫布
	canvas.renderAll();
};
