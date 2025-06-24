import createHistoryManager from "../HistoryManager";
import { serializeCanvasState, deserializeCanvasState } from "../HistoryUtils";

// 模擬 HistoryUtils 模組
jest.mock("../HistoryUtils", () => ({
	serializeCanvasState: jest.fn(),
	deserializeCanvasState: jest.fn(),
	isEraserIndicator: jest.fn(),
}));

// 模擬 fabric.js canvas 物件
const createMockCanvas = () => {
	// 模擬物件列表
	const objects = [];

	// 事件監聽器收集器
	const eventListeners = {};

	return {
		_objects: objects,
		getObjects: jest.fn(() =>
			objects.map((obj) => ({
				...obj,
				setCoords: jest.fn(), // 為每個物件添加 setCoords 方法
				set: jest.fn(), // 為每個物件添加 set 方法
			}))
		),
		on: jest.fn((eventName, callback) => {
			if (!eventListeners[eventName]) {
				eventListeners[eventName] = [];
			}
			eventListeners[eventName].push(callback);
			return callback; // 返回回調函數以便可以在測試中訪問
		}),
		off: jest.fn((eventName, callback) => {
			if (eventListeners[eventName] && callback) {
				const index = eventListeners[eventName].indexOf(callback);
				if (index !== -1) {
					eventListeners[eventName].splice(index, 1);
				}
			} else if (eventListeners[eventName]) {
				delete eventListeners[eventName];
			}
		}),
		toJSON: jest.fn(() => ({ objects, version: "5.2.1" })),
		loadFromJSON: jest.fn((json, callback) => {
			// 實際解析 JSON 並更新畫布
			try {
				if (typeof json === "string") {
					json = JSON.parse(json);
				}

				objects.length = 0;
				if (json?.objects) {
					objects.push(...json.objects);
				}

				if (callback) {
					callback();
				}
			} catch (error) {
				console.error("Error in loadFromJSON:", error);
			}
		}),
		renderAll: jest.fn(),
		// 觸發事件的輔助方法
		fireEvent: (eventName, eventData) => {
			if (eventListeners[eventName]) {
				eventListeners[eventName].forEach((callback) => callback(eventData));
			}
		},
		// 模擬添加物件
		add: function (obj) {
			objects.push(obj);
			this.fireEvent("object:added", { target: obj });
		},
		// 修正後的移除物件方法
		remove: function (obj) {
			// 使用 id 屬性來識別要移除的物件，而不是直接比較物件引用
			const index = objects.findIndex((item) => item.id === obj.id);
			if (index > -1) {
				const removedObj = objects.splice(index, 1)[0];
				this.fireEvent("object:removed", { target: removedObj });
			}
		},
		clear: jest.fn(),
		setViewportTransform: jest.fn(),
		setZoom: jest.fn(),
		requestRenderAll: jest.fn(),
		viewportTransform: [1, 0, 0, 1, 0, 0],
		getZoom: jest.fn(() => 1.5),
	};
};

describe("HistoryManager", () => {
	let mockCanvas;
	let historyManager;
	let mockSerializedState;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, "error").mockImplementation(() => {});

		// 創建模擬畫布
		mockCanvas = {
			on: jest.fn(),
			off: jest.fn(),
			getObjects: jest.fn().mockReturnValue([]),
			_objects: [],
			isClearingAll: false,
			viewportTransform: [1, 0, 0, 1, 0, 0],
			getZoom: jest.fn().mockReturnValue(1),
			setViewportTransform: jest.fn(),
			setZoom: jest.fn(),
			clear: jest.fn(),
			requestRenderAll: jest.fn(),
			loadFromJSON: jest.fn((state, callback) => callback?.()),
		};

		// 模擬序列化狀態
		mockSerializedState = '{"mock": "state"}';
		serializeCanvasState.mockReturnValue(mockSerializedState);

		// 創建歷史管理器實例
		historyManager = createHistoryManager(mockCanvas);
	});

	afterEach(() => {
		// 清理
		if (historyManager.dispose) {
			historyManager.dispose();
		}
	});

	test("應正確初始化歷史管理器", () => {
		expect(historyManager).toBeDefined();
		expect(mockCanvas.on).toHaveBeenCalled();
		expect(serializeCanvasState).toHaveBeenCalledWith(mockCanvas);
	});

	test("應正確保存狀態", () => {
		historyManager.saveState();
		expect(serializeCanvasState).toHaveBeenCalledWith(mockCanvas);
	});

	test("應正確執行復原操作", async () => {
		// 模擬有可復原的狀態
		const mockUndoState = '{"undo": "state"}';
		historyManager.undoStack.push(mockUndoState);
		historyManager.currentState = '{"current": "state"}';

		await historyManager.undo();

		expect(deserializeCanvasState).toHaveBeenCalledWith(mockCanvas, mockUndoState);
		expect(historyManager.redoStack).toContain('{"current": "state"}');
	});

	test("應正確執行重做操作", async () => {
		// 模擬有可重做的狀態
		const mockRedoState = '{"redo": "state"}';
		historyManager.redoStack.push(mockRedoState);
		historyManager.currentState = '{"current": "state"}';

		await historyManager.redo();

		expect(deserializeCanvasState).toHaveBeenCalledWith(mockCanvas, mockRedoState);
		expect(historyManager.undoStack).toContain('{"current": "state"}');
	});

	test("應正確處理工具重置回調", async () => {
		const mockCallback = jest.fn();
		historyManager.registerToolResetCallback(mockCallback);
		historyManager.undoStack.push('{"undo": "state"}');
		historyManager.currentState = '{"current": "state"}';
		jest.useFakeTimers();
		await historyManager.undo();
		await Promise.resolve();
		jest.runAllTimers();
		expect(mockCallback).toHaveBeenCalled();
		jest.useRealTimers();
	});

	test("應正確清除歷史記錄", () => {
		// 先添加一些狀態
		historyManager.undoStack.push("state1");
		historyManager.redoStack.push("state2");
		historyManager.currentState = "current";
		historyManager.registerToolResetCallback(() => {});

		historyManager.clear();

		expect(historyManager.undoStack).toHaveLength(0);
		expect(historyManager.redoStack).toHaveLength(0);
		expect(historyManager.currentState).toBeNull();
		expect(historyManager.toolResetCallback).toBeNull();
	});

	test("應正確處理錯誤情況", async () => {
		// 模擬 deserializeCanvasState 拋出錯誤
		deserializeCanvasState.mockRejectedValueOnce(new Error("Deserialization failed"));
		// 設置初始狀態
		const mockUndoState = '{"undo": "state"}';
		const mockCurrentState = '{"current": "state"}';
		historyManager.undoStack.push(mockUndoState);
		historyManager.currentState = mockCurrentState;
		await historyManager.undo();
		// 驗證錯誤處理
		expect(console.error).toHaveBeenCalled();
		expect(historyManager.currentState).toBe(mockCurrentState);
	});

	test("應正確銷毀實例", () => {
		// 模擬事件監聽器清理函數
		const mockCleanup = jest.fn();
		historyManager.cleanupListeners = mockCleanup;

		historyManager.dispose();

		expect(mockCleanup).toHaveBeenCalled();
		expect(historyManager.cleanupListeners).toBeNull();
		expect(historyManager.undoStack).toHaveLength(0);
		expect(historyManager.redoStack).toHaveLength(0);
		expect(historyManager.currentState).toBeNull();
	});
});
