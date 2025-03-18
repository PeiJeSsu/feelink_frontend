import * as fabric from "fabric";
/**
 * 處理中鍵拖曳平移
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {Object} e - 滑鼠事件
 * @param {Object} dragStart - 拖曳起點 {x, y}
 * @returns {Object} 新的拖曳起點
 */
export const handleMiddleButtonPan = (canvas, e, dragStart) => {
	if (!canvas) return dragStart;

	const deltaX = e.clientX - dragStart.x;
	const deltaY = e.clientY - dragStart.y;

	// 更新畫布視口
	const vpt = canvas.viewportTransform;
	vpt[4] += deltaX;
	vpt[5] += deltaY;
	canvas.setViewportTransform(vpt);

	// 返回新的拖曳起點
	return { x: e.clientX, y: e.clientY };
};

/**
 * 設置中鍵拖曳事件監聽器
 * @param {Object} canvas - fabric.js 畫布實例
 * @param {Function} setIsDragging - 設置拖曳狀態的函數
 * @param {Function} setDragStart - 設置拖曳起點的函數
 * @param {Function} handleMouseMove - 滑鼠移動處理函數
 * @param {Function} handleMouseUp - 滑鼠放開處理函數
 * @returns {Function} 清理函數
 */
export const setupMiddleButtonPan = (canvas, setIsDragging, setDragStart, handleMouseMove, handleMouseUp) => {
	if (!canvas) return () => {};

	const handleMouseDown = (e) => {
		if (e.button === 1) {
			// 中鍵
			e.preventDefault();
			setIsDragging(true);
			setDragStart({ x: e.clientX, y: e.clientY });
			canvas.discardActiveObject();
			canvas.renderAll();
		}
	};

	// 添加事件監聽器到 canvas 元素
	const canvasElement = canvas.upperCanvasEl;
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
