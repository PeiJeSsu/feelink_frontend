import { createEraserIndicator, setupIndicatorEventListeners } from "./EraserIndicator";

export const setupEraser = (canvas, settings) => {
	if (!canvas) return;

	canvas.isDrawingMode = false;
	canvas.selection = false;

	// 移除現有的事件監聽器
	canvas.off("mouse:down");
	canvas.off("mouse:move");
	canvas.off("mouse:up");
	canvas.off("mouse:out");
	canvas.off("mouse:over");

	// 自動將所有物件設為可擦除且不可選取
	canvas.getObjects().forEach((obj) => {
		obj._originalSelectable = obj.selectable;
		obj.selectable = false;
		obj.evented = false;
	});

	let eraserIndicator = { current: null };
	let isErasing = false;

	const createIndicatorAtPointer = (pointer) => {
		if (eraserIndicator.current) {
			canvas.remove(eraserIndicator.current);
		}
		return createEraserIndicator(canvas, pointer, settings.size);
	};

	const eventHandlers = setupIndicatorEventListeners(
		canvas,
		eraserIndicator,
		createIndicatorAtPointer
	);

	const eraseObjectsAt = (pointer) => {
		// 獲取橡皮擦範圍內的所有物件
		const objects = canvas.getObjects().filter((obj) => {
			// 跳過指示器物件
			if (obj === eraserIndicator.current) return false;
			if (obj.type === "circle" && obj.fill === "rgba(255, 0, 0, 0.3)") return false;

			// 檢查物件是否在橡皮擦範圍內
			const objCenter = obj.getCenterPoint();
			const dx = objCenter.x - pointer.x;
			const dy = objCenter.y - pointer.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// 如果物件中心點在橡皮擦範圍內，返回 true
			return distance < settings.size / 2 + obj.width / 2;
		});

		if (objects.length > 0) {
			objects.forEach((obj) => {
				canvas.remove(obj);
			});
			canvas.renderAll();
		}
	};

	// 設置 mouse:down 事件監聽器
	canvas.on("mouse:down", (opt) => {
		isErasing = true;
		const pointer = canvas.getPointer(opt.e);
		eraseObjectsAt(pointer);
	});

	// 設置 mouse:move 事件監聽器
	canvas.on("mouse:move", (opt) => {
		if (isErasing) {
			const pointer = canvas.getPointer(opt.e);
			eraseObjectsAt(pointer);
		}
	});

	// 設置 mouse:up 事件監聽器
	canvas.on("mouse:up", () => {
		isErasing = false;
	});

	// 設置新增物件時的處理
	canvas.on("object:added", (e) => {
		// 確保新增的物件不是指示器
		if (
			e.target !== eraserIndicator.current &&
			!(e.target.type === "circle" && e.target.fill === "rgba(255, 0, 0, 0.3)")
		) {
			e.target._originalSelectable = e.target.selectable;
			e.target.selectable = false;
			e.target.evented = false;
		}
	});

	return {
		updateSize: (newSize) => {
			// 更新橡皮擦大小設定
			settings.size = newSize;

			// 更新視覺指示器大小
			if (eraserIndicator.current) {
				eraserIndicator.current.set({
					radius: newSize / 2,
				});
				canvas.renderAll();
			}
		},
		// 提供清理方法
		cleanup: () => {
			eventHandlers.removeListeners();
			canvas.off("mouse:down");
			canvas.off("mouse:move");
			canvas.off("mouse:up");
			canvas.off("object:added");

			if (eraserIndicator.current) {
				canvas.remove(eraserIndicator.current);
				eraserIndicator.current = null;
			}

			// 恢復物件的可選取狀態
			canvas.getObjects().forEach((obj) => {
				if (obj._originalSelectable !== undefined) {
					obj.selectable = obj._originalSelectable;
					delete obj._originalSelectable;
				} else {
					obj.selectable = true;
				}
				obj.evented = true;
			});

			// 恢復畫布選取功能
			canvas.selection = true;
		},
	};
};

// 停用物件橡皮擦
export const disableEraser = (canvas) => {
	if (!canvas) return;

	// 移除所有事件監聽器
	canvas.off("mouse:down");
	canvas.off("mouse:move");
	canvas.off("mouse:up");
	canvas.off("mouse:over");
	canvas.off("mouse:out");
	canvas.off("object:added");

	// 移除可能存在的橡皮擦指示器
	const eraserIndicators = canvas
		.getObjects()
		.filter((obj) => obj.type === "circle" && obj.fill === "rgba(255, 0, 0, 0.3)");

	if (eraserIndicators.length > 0) {
		eraserIndicators.forEach((indicator) => {
			canvas.remove(indicator);
		});
		canvas.renderAll();
	}

	// 恢復物件的可選取狀態
	canvas.getObjects().forEach((obj) => {
		if (obj._originalSelectable !== undefined) {
			obj.selectable = obj._originalSelectable;
			delete obj._originalSelectable;
		} else {
			obj.selectable = true;
		}
		obj.evented = true;
	});

	// 恢復畫布選取功能
	canvas.selection = true;
};
