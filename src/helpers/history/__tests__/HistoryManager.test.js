import createHistoryManager from "../HistoryManager";
import { serializeCanvasState, deserializeCanvasState } from "../HistoryUtils";

// 模擬 HistoryUtils 模組
jest.mock("../HistoryUtils", () => ({
	serializeCanvasState: jest.fn(),
	deserializeCanvasState: jest.fn(),
	isEraserIndicator: jest.fn(),
}));

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
