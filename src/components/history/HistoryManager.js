class HistoryManager {
	constructor(canvas) {
		this.canvas = canvas;
		this.undoStack = [];
		this.redoStack = [];
		this.isUndoRedoing = false;
		this.currentState = null;
		this.setupEventListeners();
		console.log("HistoryManager initialized:", this);
	}

	setupEventListeners() {
		if (!this.canvas) return;

		// 監聽物件修改事件
		this.canvas.on("object:modified", (e) => {
			if (this.isEraserIndicator(e.target)) return;
			console.log("Object modified event triggered");
			if (!this.isUndoRedoing) {
				this.saveState();
			}
		});

		// 監聽物件添加事件
		this.canvas.on("object:added", (e) => {
			if (this.isEraserIndicator(e.target)) return;
			console.log("Object added event triggered");
			if (!this.isUndoRedoing) {
				this.saveState();
			}
		});

		// 監聽物件移除事件
		this.canvas.on("object:removed", (e) => {
			if (this.isEraserIndicator(e.target)) return;
			console.log("Object removed event triggered");
			if (!this.isUndoRedoing) {
				this.saveState();
			}
		});

		// 監聽路徑創建事件（用於筆跡）
		this.canvas.on("path:created", (e) => {
			if (this.isEraserIndicator(e.path)) return;
			console.log("Path created event triggered");
			if (!this.isUndoRedoing) {
				this.saveState();
			}
		});
	}

	// 新增一個方法來檢查物件是否為橡皮擦指示器
	isEraserIndicator(obj) {
		return obj && obj.type === "circle" && obj.fill === "rgba(255, 0, 0, 0.3)";
	}

	saveState() {
		const jsonState = JSON.stringify(
			this.canvas.toJSON(["selectable", "erasable", "evented", "_originalSelectable"])
		);

		if (this.currentState) {
			this.undoStack.push(this.currentState);
		}

		this.currentState = jsonState;

		this.redoStack = [];

		console.log("State saved:", {
			currentState: "exists",
			undoStackLength: this.undoStack.length,
			redoStackLength: this.redoStack.length,
		});
	}

	undo() {
		console.log("Undo called:", {
			undoStackLength: this.undoStack.length,
			redoStackLength: this.redoStack.length,
		});

		if (this.undoStack.length > 0) {
			this.isUndoRedoing = true;

			try {
				if (this.currentState) {
					this.redoStack.push(this.currentState);
				}

				this.currentState = this.undoStack.pop();

				this.loadCanvasState(this.currentState);

				console.log("Undo in progress:", {
					undoStackLength: this.undoStack.length,
					redoStackLength: this.redoStack.length,
				});
			} catch (error) {
				console.error("Error in undo operation:", error);
			} finally {
				this.isUndoRedoing = false;
			}
		}
	}

	redo() {
		console.log("Redo called:", {
			undoStackLength: this.undoStack.length,
			redoStackLength: this.redoStack.length,
		});

		if (this.redoStack.length > 0) {
			this.isUndoRedoing = true;

			try {
				if (this.currentState) {
					this.undoStack.push(this.currentState);
				}

				this.currentState = this.redoStack.pop();

				this.loadCanvasState(this.currentState);

				console.log("Redo in progress:", {
					undoStackLength: this.undoStack.length,
					redoStackLength: this.redoStack.length,
				});
			} catch (error) {
				console.error("Error in redo operation:", error);
			} finally {
				this.isUndoRedoing = false;
			}
		}
	}

	loadCanvasState(jsonState) {
		if (!jsonState) return;

		console.log("Loading canvas state...");

		const currentViewport = this.canvas.viewportTransform;
		const currentZoom = this.canvas.getZoom();

		this.canvas.clear();

		try {
			const state = JSON.parse(jsonState);

			this.canvas.loadFromJSON(state, () => {
				if (currentViewport) {
					this.canvas.setViewportTransform(currentViewport);
				}
				if (currentZoom) {
					this.canvas.setZoom(currentZoom);
				}

				this.canvas.getObjects().forEach((obj) => {
					if (obj.erasable !== undefined) {
						obj.set("erasable", true);
					}
					obj.setCoords();
				});

				this.canvas.requestRenderAll();
				console.log("Canvas state loaded and rendered");
			});
		} catch (error) {
			console.error("Error loading canvas state:", error);
		}
	}

	clear() {
		this.undoStack = [];
		this.redoStack = [];
		this.currentState = null;
		console.log("History cleared");
	}
}

export default HistoryManager;
