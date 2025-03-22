/**
 * 從畫布生成預覽圖像
 * @param {fabric.Canvas} canvas - fabric.js 畫布對象
 * @param {string} format - 圖像格式 ('png' 或 'jpg')
 * @param {boolean} transparentBg - 是否使用透明背景
 * @returns {Promise<{dataURL: string, contentSize: object}>} - 包含圖像數據和內容尺寸的物件
 */
export const generateCanvasPreview = (canvas, format, transparentBg) => {
	return new Promise((resolve, reject) => {
		if (!canvas) {
			reject(new Error("畫布未初始化"));
			return;
		}

		try {
			// 保存原始狀態
			const originalBgColor = canvas.backgroundColor;
			const originalZoom = canvas.getZoom();
			const originalViewportTransform = [...canvas.viewportTransform];

			// 臨時重設畫布視圖
			canvas.setZoom(1);
			canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

			// 計算包含所有物件的邊界框
			const objects = canvas.getObjects();
			let minX = Number.MAX_VALUE;
			let minY = Number.MAX_VALUE;
			let maxX = Number.MIN_VALUE;
			let maxY = Number.MIN_VALUE;

			if (objects.length > 0) {
				objects.forEach((obj) => {
					const bounds = obj.getBoundingRect(true, true);
					minX = Math.min(minX, bounds.left);
					minY = Math.min(minY, bounds.top);
					maxX = Math.max(maxX, bounds.left + bounds.width);
					maxY = Math.max(maxY, bounds.top + bounds.height);
				});

				if (objects.length === 1) {
					if (Math.abs(minX) < 1 && Math.abs(minY) < 1) {
						minX = -canvas.width / 4;
						minY = -canvas.height / 4;
						maxX = canvas.width * 1.25;
						maxY = canvas.height * 1.25;
					}
				}
			} else {
				minX = -canvas.width / 4;
				minY = -canvas.height / 4;
				maxX = canvas.width * 1.25;
				maxY = canvas.height * 1.25;
			}

			const padding = Math.max(100, canvas.width * 0.2, canvas.height * 0.2);
			minX = minX - padding;
			minY = minY - padding;
			maxX = maxX + padding;
			maxY = maxY + padding;

			const contentWidth = maxX - minX;
			const contentHeight = maxY - minY;

			// 生成預覽圖像
			const dataURL = canvas.toDataURL({
				format: format === "jpg" ? "jpeg" : "png",
				quality: 1,
				left: minX,
				top: minY,
				width: contentWidth,
				height: contentHeight,
				multiplier: 1,
				backgroundColor: transparentBg && format === "png" ? "" : canvas.backgroundColor || "#ffffff",
			});

			// 恢復原始狀態
			canvas.setViewportTransform(originalViewportTransform);
			canvas.setZoom(originalZoom);
			if (originalBgColor !== canvas.backgroundColor) {
				canvas.backgroundColor = originalBgColor;
				canvas.renderAll();
			}

			resolve({
				dataURL,
				contentSize: {
					width: contentWidth,
					height: contentHeight,
					left: minX,
					top: minY,
				},
			});
		} catch (error) {
			console.error("生成預覽圖像時出錯:", error);
			reject(error);
		}
	});
};

/**
 * 根據選區匯出畫布圖像
 * @param {fabric.Canvas} canvas - fabric.js 畫布對象
 * @param {object} selection - 選區信息 {x, y, width, height}
 * @param {object} contentSize - 畫布內容尺寸
 * @param {string} format - 圖像格式 ('png' 或 'jpg')
 * @param {boolean} transparentBg - 是否使用透明背景
 * @returns {Promise<string>} - 圖像的 DataURL
 */
export const exportCanvasSelection = (canvas, selection, contentSize, format, transparentBg) => {
	return new Promise((resolve, reject) => {
		if (!canvas) {
			reject(new Error("畫布未初始化"));
			return;
		}

		try {
			// 保存原始狀態
			const originalBgColor = canvas.backgroundColor;
			const originalZoom = canvas.getZoom();
			const originalViewportTransform = [...canvas.viewportTransform];

			// 臨時重設畫布視圖
			canvas.setZoom(1);
			canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

			// 如果選擇透明背景且格式是 PNG，則設置背景為透明
			if (transparentBg && format === "png") {
				canvas.backgroundColor = "";
				canvas.renderAll();
			}

			// 計算在畫布坐標中的選區
			const left = contentSize.left + selection.x;
			const top = contentSize.top + selection.y;
			const width = selection.width;
			const height = selection.height;

			// 生成匯出圖像
			const dataURL = canvas.toDataURL({
				format: format === "jpg" ? "jpeg" : "png",
				quality: 1,
				left: left,
				top: top,
				width: width,
				height: height,
				multiplier: 2, // 增加解析度
				backgroundColor: transparentBg && format === "png" ? "" : canvas.backgroundColor || "#ffffff",
			});

			// 恢復原始狀態
			canvas.setViewportTransform(originalViewportTransform);
			canvas.setZoom(originalZoom);
			if (originalBgColor !== canvas.backgroundColor) {
				canvas.backgroundColor = originalBgColor;
				canvas.renderAll();
			}

			resolve(dataURL);
		} catch (error) {
			console.error("匯出圖像時出錯:", error);
			reject(error);
		}
	});
};
