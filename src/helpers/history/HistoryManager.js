import { setupHistoryEventListeners } from "./HistoryEventListeners";
import { serializeCanvasState, deserializeCanvasState } from "./HistoryUtils";

/**
 * 歷史管理器類別
 * 負責管理畫布的復原/重做歷史
 */
class HistoryManager {
	/**
	 * @param {Object} canvas - Fabric.js 畫布實例
	 */
	constructor(canvas) {
		this.canvas = canvas;
		this.undoStack = [];
		this.redoStack = [];
		this.currentState = null;
		this.toolResetCallback = null;
		this.isUndoRedoing = false;
		this.MAX_STACK_SIZE = 30;
		this.cleanupListeners = null;

		this.initialize();
	}

	/**
	 * 初始化歷史管理器
	 * @private
	 */
	initialize() {
		if (!this.canvas) {
			console.warn("HistoryManager: Canvas is not provided");
			return;
		}

		// 設置事件監聽器
		this.cleanupListeners = setupHistoryEventListeners(
			this.canvas,
			() => this.saveState(),
			() => this.isUndoRedoing
		);

		// 保存初始狀態
		this.saveState();
		console.log("HistoryManager initialized");
	}

	/**
	 * 保存當前畫布狀態
	 */
	saveState() {
		const jsonState = serializeCanvasState(this.canvas);
		if (!jsonState) return;

		if (this.currentState) {
			this.undoStack.push(this.currentState);
			// 如果超過最大堆疊大小，移除最舊的狀態
			if (this.undoStack.length > this.MAX_STACK_SIZE) {
				this.undoStack.shift();
			}
		}

		this.currentState = jsonState;
		this.redoStack = [];

		console.log("State saved:", {
			currentState: "exists",
			undoStackLength: this.undoStack.length,
			redoStackLength: this.redoStack.length,
		});
	}

	/**
	 * 執行復原操作
	 */
	async undo() {
		console.log("Undo called:", {
			undoStackLength: this.undoStack.length,
			redoStackLength: this.redoStack.length,
		});

		if (this.undoStack.length === 0) return;

		this.isUndoRedoing = true;

		try {
			if (this.currentState) {
				this.redoStack.push(this.currentState);
			}

			this.currentState = this.undoStack.pop();
			await deserializeCanvasState(this.canvas, this.currentState);

			console.log("Undo completed:", {
				undoStackLength: this.undoStack.length,
				redoStackLength: this.redoStack.length,
			});

			// 如果有工具重置回調，則調用它
			if (this.toolResetCallback) {
				setTimeout(() => this.toolResetCallback(), 10);
			}
		} catch (error) {
			console.error("Error in undo operation:", error);
			// 發生錯誤時，嘗試恢復到上一個有效狀態
			if (this.currentState) {
				this.undoStack.push(this.currentState);
			}
			this.currentState = this.redoStack.pop();
		} finally {
			this.isUndoRedoing = false;
		}
	}

	/**
	 * 執行重做操作
	 */
	async redo() {
		console.log("Redo called:", {
			undoStackLength: this.undoStack.length,
			redoStackLength: this.redoStack.length,
		});

		if (this.redoStack.length === 0) return;

		this.isUndoRedoing = true;

		try {
			if (this.currentState) {
				this.undoStack.push(this.currentState);
			}

			this.currentState = this.redoStack.pop();
			await deserializeCanvasState(this.canvas, this.currentState);

			console.log("Redo completed:", {
				undoStackLength: this.undoStack.length,
				redoStackLength: this.redoStack.length,
			});

			// 如果有工具重置回調，則調用它
			if (this.toolResetCallback) {
				setTimeout(() => this.toolResetCallback(), 10);
			}
		} catch (error) {
			console.error("Error in redo operation:", error);
			// 發生錯誤時，嘗試恢復到上一個有效狀態
			if (this.currentState) {
				this.redoStack.push(this.currentState);
			}
			this.currentState = this.undoStack.pop();
		} finally {
			this.isUndoRedoing = false;
		}
	}

	/**
	 * 註冊工具重置回調函數
	 * @param {Function} callback - 工具重置回調函數
	 */
	registerToolResetCallback(callback) {
		this.toolResetCallback = callback;
	}

	/**
	 * 取消註冊工具重置回調函數
	 */
	unregisterToolResetCallback() {
		this.toolResetCallback = null;
	}

	/**
	 * 清除歷史記錄
	 */
	clear() {
		this.undoStack = [];
		this.redoStack = [];
		this.currentState = null;
		this.toolResetCallback = null;
		console.log("History cleared");
	}

	/**
	 * 銷毀歷史管理器實例
	 */
	dispose() {
		if (this.cleanupListeners) {
			this.cleanupListeners();
			this.cleanupListeners = null;
		}
		this.clear();
	}
}

// 為了保持向後相容性，導出工廠函數
const createHistoryManager = (canvas) => {
	return new HistoryManager(canvas);
};

export default createHistoryManager;
