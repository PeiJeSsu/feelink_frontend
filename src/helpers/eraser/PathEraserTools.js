import { createEraserIndicator, setupIndicatorEventListeners } from "./EraserIndicator";
import { EraserBrush, ClippingGroup } from "@erase2d/fabric";

// 設置筆跡橡皮擦工具
export const setupPathEraser = (canvas, settings) => {
	if (!canvas) return;

	// 確保畫布處於繪圖模式
	canvas.isDrawingMode = true;

	// 使用對象引用來存儲橡皮擦，這樣可以更新它
	const eraserRef = {
		current: new EraserBrush(canvas),
	};

	// 設置橡皮擦寬度
	eraserRef.current.width = settings.size || 20;

	// 移除現有的事件監聽器
	canvas.off("mouse:down");
	canvas.off("mouse:move");
	canvas.off("mouse:up");
	canvas.off("mouse:out");
	canvas.off("mouse:over");

	// 自動將所有物件設為可擦除
	setAllObjectsErasable(canvas);

	// 設置橡皮擦事件
	const setupEraserEvents = (eraser) => {
		// 監聽橡皮擦開始事件
		eraser.on("start", (e) => {
			console.log("開始擦除");
		});

		// 監聽橡皮擦結束事件
		eraser.on("end", async (e) => {
			const { path, targets } = e.detail;

			await eraser.commit({ path, targets });

			const hasErasedObjects = targets.some((obj) => obj.clipPath instanceof ClippingGroup);
			if (hasErasedObjects) {
				console.log("成功擦除部分物件");
			}

			canvas.renderAll();

			// 在橡皮擦操作結束後保存狀態
			if (canvas.historyManager) {
				canvas.historyManager.saveState();
			}
		});
	};

	// 設置初始橡皮擦事件
	setupEraserEvents(eraserRef.current);

	// 創建一個視覺指示器引用
	let eraserIndicator = { current: null };

	// 創建指示器的函數
	const createIndicatorAtPointer = (pointer) => {
		return createEraserIndicator(canvas, pointer, settings.size);
	};

	// 設置指示器事件監聽器
	const eventHandlers = setupIndicatorEventListeners(canvas, eraserIndicator, createIndicatorAtPointer);

	// 將橡皮擦設置為當前畫筆
	canvas.freeDrawingBrush = eraserRef.current;

	// 添加畫筆創建事件監聽器
	canvas.on("path:created", () => {
		// 將新創建的路徑設為可擦除
		const paths = canvas.getObjects().filter((obj) => obj.type === "path");
		if (paths.length > 0) {
			makeObjectErasable(paths[paths.length - 1]);
		}
	});

	// 新增: 重新創建橡皮擦的函數
	const recreateEraser = () => {
		// 儲存當前寬度
		const currentWidth = eraserRef.current.width;

		// 創建新的橡皮擦
		eraserRef.current = new EraserBrush(canvas);
		eraserRef.current.width = currentWidth;

		// 設置事件
		setupEraserEvents(eraserRef.current);

		// 更新畫布的畫筆
		canvas.freeDrawingBrush = eraserRef.current;

		// 確保所有物件都可擦除
		setAllObjectsErasable(canvas);
	};

	// 註冊 undo/redo 後的重置函數
	if (canvas.historyManager) {
		canvas.historyManager.registerToolResetCallback(() => {
			recreateEraser();
		});
	}

	return {
		updateSize: (newSize) => {
			// 更新橡皮擦大小
			eraserRef.current.width = newSize;

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
			// 取消工具重置回調
			if (canvas.historyManager) {
				canvas.historyManager.unregisterToolResetCallback();
			}

			eventHandlers.removeListeners();
			if (eraserIndicator.current) {
				canvas.remove(eraserIndicator.current);
				eraserIndicator.current = null;
			}
		},
		// 提供重置方法
		reset: () => {
			recreateEraser();
		},
		// 暴露 eraserIndicator 方便測試
		eraserIndicator,
	};
};

// 停用筆跡橡皮擦
export const disablePathEraser = (canvas) => {
	if (!canvas) return;

	// 移除所有事件監聽器
	canvas.off("mouse:move");
	canvas.off("mouse:over");
	canvas.off("mouse:out");

	// 移除可能存在的橡皮擦指示器
	const eraserIndicator = canvas.getObjects().find((obj) => obj.type === "circle" && obj.fill === "rgba(255, 0, 0, 0.3)");

	if (eraserIndicator) {
		canvas.remove(eraserIndicator);
		canvas.renderAll();
	}
};

export const makeObjectErasable = (obj) => {
	if (obj) {
		obj.set("erasable", true);
		return obj;
	}
};

export const setAllObjectsErasable = (canvas) => {
	if (!canvas) return;

	canvas.getObjects().forEach((obj) => {
		if (obj.type !== "circle" || obj.fill !== "rgba(255, 0, 0, 0.3)") makeObjectErasable(obj);
	});
};
