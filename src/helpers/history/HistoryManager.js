const createHistoryManager = (canvas) => {
	let undoStack = [];
	let redoStack = [];
	let isUndoRedoing = false;
	let currentState = null;
	let toolResetCallback = null;
	const MAX_STACK_SIZE = 30; // 添加最大堆疊大小限制

	// 檢查物件是否為橡皮擦指示器
	const isEraserIndicator = (obj) => {
		return obj && obj.type === "circle" && obj.fill === "rgba(255, 0, 0, 0.3)";
	};

	const setupEventListeners = () => {
		if (!canvas) return;

		// 監聽物件修改事件
		canvas.on("object:modified", (e) => {
			if (isEraserIndicator(e.target)) return;
			console.log("Object modified event triggered");
			if (!isUndoRedoing) {
				saveState();
			}
		});

		// 監聽物件添加事件
		canvas.on("object:added", (e) => {
			if (isEraserIndicator(e.target)) return;
			console.log("Object added event triggered");
			if (!isUndoRedoing) {
				saveState();
			}
		});

		// 監聽物件移除事件
		canvas.on("object:removed", (e) => {
			if (canvas.isClearingAll) return;
			if (isEraserIndicator(e.target)) return;
			console.log("Object removed event triggered");
			if (!isUndoRedoing) {
				saveState();
			}
		});

		// 監聽路徑創建事件（用於筆跡）
		canvas.on("path:created", (e) => {
			if (isEraserIndicator(e.path)) return;
			console.log("Path created event triggered");
			if (!isUndoRedoing) {
				saveState();
			}
		});
	};

	// 保存狀態
	const saveState = () => {
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

		if (currentState) {
			undoStack.push(currentState);
			// 如果超過最大堆疊大小，移除最舊的狀態
			if (undoStack.length > MAX_STACK_SIZE) {
				undoStack.shift();
			}
		}

		currentState = jsonState;

		redoStack = [];

		console.log("State saved:", {
			currentState: "exists",
			undoStackLength: undoStack.length,
			redoStackLength: redoStack.length,
		});
	};

	// 復原
	const undo = () => {
		console.log("Undo called:", {
			undoStackLength: undoStack.length,
			redoStackLength: redoStack.length,
		});

		if (undoStack.length > 0) {
			isUndoRedoing = true;

			try {
				if (currentState) {
					redoStack.push(currentState);
				}

				currentState = undoStack.pop();

				loadCanvasState(currentState);

				console.log("Undo in progress:", {
					undoStackLength: undoStack.length,
					redoStackLength: redoStack.length,
				});

				// 新增: 如果有工具重置回調，則調用它
				if (toolResetCallback) {
					setTimeout(() => toolResetCallback(), 10);
				}
			} catch (error) {
				console.error("Error in undo operation:", error);
			} finally {
				isUndoRedoing = false;
			}
		}
	};

	// 重做
	const redo = () => {
		console.log("Redo called:", {
			undoStackLength: undoStack.length,
			redoStackLength: redoStack.length,
		});

		if (redoStack.length > 0) {
			isUndoRedoing = true;

			try {
				if (currentState) {
					undoStack.push(currentState);
				}

				currentState = redoStack.pop();

				loadCanvasState(currentState);

				console.log("Redo in progress:", {
					undoStackLength: undoStack.length,
					redoStackLength: redoStack.length,
				});

				// 新增: 如果有工具重置回調，則調用它
				if (toolResetCallback) {
					setTimeout(() => toolResetCallback(), 10);
				}
			} catch (error) {
				console.error("Error in redo operation:", error);
			} finally {
				isUndoRedoing = false;
			}
		}
	};

	// 加載畫布狀態
	const loadCanvasState = (jsonState) => {
		if (!jsonState) return;

		console.log("Loading canvas state...");

		const currentViewport = canvas.viewportTransform;
		const currentZoom = canvas.getZoom();

		canvas.clear();

		try {
			const state = JSON.parse(jsonState);

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
				console.log("Canvas state loaded and rendered");
			});
		} catch (error) {
			console.error("Error loading canvas state:", error);
		}
	};

	const registerToolResetCallback = (callback) => {
		toolResetCallback = callback;
	};

	const unregisterToolResetCallback = () => {
		toolResetCallback = null;
	};

	const clear = () => {
		undoStack = [];
		redoStack = [];
		currentState = null;
		toolResetCallback = null;
		console.log("History cleared");
	};

	// 初始化
	setupEventListeners();
	console.log("HistoryManager initialized");

	// 返回與原類相同的公共介面，並添加新方法
	return {
		saveState,
		undo,
		redo,
		loadCanvasState,
		clear,
		isEraserIndicator,
		registerToolResetCallback,
		unregisterToolResetCallback,
	};
};

export default createHistoryManager;
