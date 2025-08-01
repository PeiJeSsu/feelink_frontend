import * as fabric from "fabric";
/**
 * 獲取事件的客戶端座標 (支援滑鼠和觸控)
 * @param {Object} e - 事件物件
 * @returns {Object} 座標 {x, y}
 */
const getEventCoordinates = (e) => {
	// 如果是觸控事件，使用 touches 或 changedTouches
	if (e.touches && e.touches.length > 0) {
		return { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}
	if (e.changedTouches && e.changedTouches.length > 0) {
		return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
	}
	// 否則使用滑鼠事件座標
	return { x: e.clientX, y: e.clientY };
};

/**
 * 處理中鍵拖曳平移
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {Object} e - 滑鼠/觸控事件
 * @param {Object} dragStart - 拖曳起點 {x, y}
 * @returns {Object} 新的拖曳起點
 */
export const handleMiddleButtonPan = (canvas, e, dragStart) => {
	if (!canvas) return dragStart;

	const coords = getEventCoordinates(e);
	const deltaX = coords.x - dragStart.x;
	const deltaY = coords.y - dragStart.y;

	// 更新畫布視口
	const vpt = canvas.viewportTransform;
	vpt[4] += deltaX;
	vpt[5] += deltaY;
	canvas.setViewportTransform(vpt);

	// 返回新的拖曳起點
	return { x: coords.x, y: coords.y };
};

/**
 * 設置中鍵拖曳事件監聽器 (僅限桌面端)
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {Function} setIsDragging - 設置拖曳狀態的函數
 * @param {Function} setDragStart - 設置拖曳起點的函數
 * @param {Function} handleMouseMove - 滑鼠移動處理函數
 * @param {Function} handleMouseUp - 滑鼠放開處理函數
 * @returns {Function} 清理函數
 */
export const setupMiddleButtonPan = (canvas, setIsDragging, setDragStart, handleMouseMove, handleMouseUp) => {
	if (!canvas?.upperCanvasEl) return () => {};

	const handleMouseDown = (e) => {
		if (e.button === 1) {
			// 中鍵
			e.preventDefault();
			const coords = getEventCoordinates(e);
			setIsDragging(true);
			setDragStart({ x: coords.x, y: coords.y });
			canvas.discardActiveObject();
			canvas.renderAll();
		}
	};

	// 只添加滑鼠事件監聽器 (不添加觸控事件，避免影響其他功能)
	const canvasElement = canvas.upperCanvasEl;
	if (!canvasElement) {
		console.warn("Canvas element not ready for pan controls");
		return () => {};
	}
	
	canvasElement.addEventListener("mousedown", handleMouseDown);
	window.addEventListener("mousemove", handleMouseMove);
	window.addEventListener("mouseup", handleMouseUp);

	// 返回清理函數
	return () => {
		if (canvasElement) {
			canvasElement.removeEventListener("mousedown", handleMouseDown);
		}
		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
	};
};

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

		// 滑鼠/觸控按下事件
		canvas.on("mouse:down", function (opt) {
			const evt = opt.e;
			
			// 阻止預設行為以避免頁面滾動
			if (evt.preventDefault) {
				evt.preventDefault();
			}
			
			isDragging = true;
			canvas.defaultCursor = "grabbing";
			const coords = getEventCoordinates(evt);
			lastPosX = coords.x;
			lastPosY = coords.y;
		});

		// 滑鼠/觸控移動事件
		canvas.on("mouse:move", function (opt) {
			if (isDragging) {
				const evt = opt.e;
				
				// 阻止預設行為以避免頁面滾動
				if (evt.preventDefault) {
					evt.preventDefault();
				}
				
				const coords = getEventCoordinates(evt);
				const deltaX = coords.x - lastPosX;
				const deltaY = coords.y - lastPosY;

				// 只有在移動距離足夠大時才進行平移，避免輕微觸碰造成移動
				const minMovement = 2;
				if (Math.abs(deltaX) > minMovement || Math.abs(deltaY) > minMovement) {
					// 避免過度的移動量造成視角飛走
					const maxDelta = 50; // 進一步減少最大移動量
					const clampedDeltaX = Math.max(-maxDelta, Math.min(maxDelta, deltaX));
					const clampedDeltaY = Math.max(-maxDelta, Math.min(maxDelta, deltaY));

					// 更新畫布視口位置
					canvas.relativePan(new fabric.Point(clampedDeltaX, clampedDeltaY));

					lastPosX = coords.x;
					lastPosY = coords.y;
				}
			}
		});

		// 滑鼠/觸控放開事件
		canvas.on("mouse:up", function () {
			isDragging = false;
			canvas.defaultCursor = "grab";
		});
	}
};
