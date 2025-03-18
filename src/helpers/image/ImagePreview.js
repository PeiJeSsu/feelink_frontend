/**
 * 計算圖像在容器中的最佳顯示比例和位置
 * @param {Object} containerSize - 容器尺寸 {width, height}
 * @param {Object} imageSize - 圖像尺寸 {width, height}
 * @param {number} padding - 邊距
 * @returns {Object} - 包含縮放比例和位置的對象
 */
export const calculateImageDisplayProps = (containerSize, imageSize, padding = 40) => {
	const scaleX = (containerSize.width - padding * 2) / imageSize.width;
	const scaleY = (containerSize.height - padding * 2) / imageSize.height;
	const scale = Math.min(scaleX, scaleY, 0.9);

	const scaledWidth = imageSize.width * scale;
	const scaledHeight = imageSize.height * scale;

	return {
		scale,
		offset: {
			x: Math.max((containerSize.width - scaledWidth) / 2, padding),
			y: Math.max((containerSize.height - scaledHeight) / 2, padding),
		},
	};
};

/**
 * 計算初始選區位置
 * @param {Object} imageSize - 縮放後的圖像尺寸 {width, height}
 * @param {Object} offset - 圖像偏移量 {x, y}
 * @param {number} maxWidth - 最大寬度
 * @param {number} maxHeight - 最大高度
 * @returns {Object} - 選區位置 {x, y, width, height}
 */
export const calculateInitialSelection = (imageSize, offset, maxWidth = 500, maxHeight = 500) => {
	const width = Math.min(maxWidth, imageSize.width * 0.8);
	const height = Math.min(maxHeight, imageSize.height * 0.8);

	return {
		x: (imageSize.width - width) / 2 + offset.x,
		y: (imageSize.height - height) / 2 + offset.y,
		width,
		height,
	};
};

/**
 * 將選區位置轉換為相對於原始圖像的比例位置
 * @param {Object} selection - 選區位置 {x, y, width, height}
 * @param {Object} offset - 圖像偏移量 {x, y}
 * @param {number} scale - 圖像縮放比例
 * @returns {Object} - 相對位置 {x, y, width, height}
 */
export const convertSelectionToImageCoordinates = (selection, offset, scale) => {
	return {
		x: (selection.x - offset.x) / scale,
		y: (selection.y - offset.y) / scale,
		width: selection.width / scale,
		height: selection.height / scale,
	};
};
