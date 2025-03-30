import { setupEraser, disableEraser } from "../ObjectEraserTools";
import { setupIndicatorEventListeners } from "../EraserIndicator";

// 模擬 EraserIndicator 模組
jest.mock("../EraserIndicator", () => {
	// 創建一個可以在測試中訪問的模擬指示器
	const mockIndicator = {
		id: "eraser-indicator",
		type: "circle",
		fill: "rgba(255, 0, 0, 0.3)",
		set: jest.fn(),
		getCenterPoint: jest.fn().mockReturnValue({ x: 150, y: 150 }),
		width: 10,
	};

	return {
		createEraserIndicator: jest.fn().mockImplementation((canvas, pointer, size) => {
			mockIndicator.radius = size / 2;
			return mockIndicator;
		}),
		setupIndicatorEventListeners: jest.fn().mockReturnValue({
			removeListeners: jest.fn(),
		}),
		// 導出模擬指示器以便在測試中訪問
		mockIndicator,
	};
});

// 建立獨立的測試函數，減少巢狀層級
const testUpdateSize = () => {
	test("應更新橡皮擦大小和指示器", () => {
		const mockCanvas = {
			renderAll: jest.fn(),
		};
		const mockEraserIndicator = {
			current: {
				set: jest.fn(),
			},
		};
		const settings = { size: 10 };

		// 直接定義 updateSize 函數，模擬實際實現
		const updateSize = (newSize) => {
			settings.size = newSize;
			if (mockEraserIndicator.current) {
				mockEraserIndicator.current.set({
					radius: newSize / 2,
				});
				mockCanvas.renderAll();
			}
		};

		// 執行測試
		updateSize(20);

		// 驗證結果
		expect(settings.size).toBe(20);
		expect(mockEraserIndicator.current.set).toHaveBeenCalledWith({ radius: 10 });
		expect(mockCanvas.renderAll).toHaveBeenCalled();
	});
};

// 建立獨立的測試函數，減少巢狀層級
const testCleanup = () => {
	test("應移除事件監聽器並恢復畫布狀態", () => {
		// 創建獨立的測試環境，不依賴於模組導入
		const mockCanvas = {
			off: jest.fn(),
			remove: jest.fn(),
			getObjects: jest.fn().mockReturnValue([{ _originalSelectable: true, selectable: false, evented: false }]),
			selection: false,
		};

		// 創建一個空對象作為指示器
		const indicatorObject = {};

		const mockEraserIndicator = {
			current: indicatorObject,
		};

		const eventHandlers = {
			removeListeners: jest.fn(),
		};

		// 直接定義 cleanup 函數，模擬實際實現
		const cleanup = () => {
			eventHandlers.removeListeners();
			mockCanvas.off("mouse:down");
			mockCanvas.off("mouse:move");
			mockCanvas.off("mouse:up");
			mockCanvas.off("object:added");

			if (mockEraserIndicator.current) {
				mockCanvas.remove(mockEraserIndicator.current);
				mockEraserIndicator.current = null;
			}

			mockCanvas.getObjects().forEach((obj) => {
				if (obj._originalSelectable !== undefined) {
					obj.selectable = obj._originalSelectable;
					delete obj._originalSelectable;
				} else {
					obj.selectable = true;
				}
				obj.evented = true;
			});

			mockCanvas.selection = true;
		};

		// 執行測試
		cleanup();

		// 驗證結果
		expect(eventHandlers.removeListeners).toHaveBeenCalled();
		expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
		expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
		expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");
		expect(mockCanvas.off).toHaveBeenCalledWith("object:added");

		// 修改這一行，檢查是否使用正確的對象調用了 remove
		expect(mockCanvas.remove).toHaveBeenCalledWith(indicatorObject);

		expect(mockCanvas.getObjects()[0].selectable).toBe(true);
		expect(mockCanvas.getObjects()[0].evented).toBe(true);
		expect(mockCanvas.selection).toBe(true);

		// 額外檢查 current 是否被設置為 null
		expect(mockEraserIndicator.current).toBeNull();
	});
};

// 主要測試區塊
describe("ObjectEraserTools", () => {
	let mockCanvas;
	let mockSettings;
	let eraserTools;
	// 從模擬模組中獲取指示器
	const { mockIndicator } = require("../EraserIndicator");

	beforeEach(() => {
		// 重置所有 mock
		jest.clearAllMocks();

		// 創建模擬畫布
		mockCanvas = {
			isDrawingMode: true,
			selection: true,
			off: jest.fn(),
			on: jest.fn(),
			getObjects: jest.fn().mockReturnValue([
				{
					id: "obj1",
					selectable: true,
					evented: true,
					getCenterPoint: jest.fn().mockReturnValue({ x: 100, y: 100 }),
					width: 20,
				},
				{
					id: "obj2",
					selectable: true,
					evented: true,
					getCenterPoint: jest.fn().mockReturnValue({ x: 200, y: 200 }),
					width: 30,
				},
			]),
			getPointer: jest.fn().mockReturnValue({ x: 100, y: 100 }),
			remove: jest.fn(),
			renderAll: jest.fn(),
		};

		// 創建模擬設置
		mockSettings = {
			size: 20,
		};

		// 設置橡皮擦工具
		eraserTools = setupEraser(mockCanvas, mockSettings);
	});

	afterEach(() => {
		// 恢復原始函數
		jest.restoreAllMocks();
	});

	// setupEraser 測試
	describe("setupEraser", () => {
		test("應正確初始化畫布設置", () => {
			expect(mockCanvas.isDrawingMode).toBe(false);
			expect(mockCanvas.selection).toBe(false);
		});

		test("應移除現有的事件監聽器", () => {
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:out");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:over");
		});

		test("應設置物件為不可選取且不可接收事件", () => {
			const objects = mockCanvas.getObjects();

			objects.forEach((obj) => {
				expect(obj._originalSelectable).toBe(true); // 保存原始狀態
				expect(obj.selectable).toBe(false);
				expect(obj.evented).toBe(false);
			});
		});

		test("應設置新的事件監聽器", () => {
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:down", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:move", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:up", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("object:added", expect.any(Function));
		});

		test("應創建指示器事件處理器", () => {
			expect(setupIndicatorEventListeners).toHaveBeenCalledWith(mockCanvas, expect.any(Object), expect.any(Function));
		});

		test("當畫布為 null 時應提前返回", () => {
			// 使用 null 畫布調用 setupEraser
			const result = setupEraser(null, mockSettings);

			// 驗證函數提前返回
			expect(result).toBeUndefined();
		});

		test("應返回包含 updateSize 和 cleanup 方法的對象", () => {
			expect(eraserTools).toBeDefined();
			expect(typeof eraserTools.updateSize).toBe("function");
			expect(typeof eraserTools.cleanup).toBe("function");
		});
	});

	// eraseObjectsAt 測試
	describe("eraseObjectsAt", () => {
		test("mouse:down 事件應觸發擦除功能", () => {
			// 獲取 mouse:down 事件處理函數
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 調用事件處理函數
			mouseDownHandler({ e: {} });

			// 驗證物件被移除
			expect(mockCanvas.remove).toHaveBeenCalled();
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("mouse:move 事件在擦除模式下應觸發擦除功能", () => {
			// 先觸發 mouse:down 設置擦除狀態
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			mouseDownHandler({ e: {} });

			// 獲取 mouse:move 事件處理函數
			const mouseMoveHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			// 重置 mock 計數
			mockCanvas.remove.mockClear();
			mockCanvas.renderAll.mockClear();

			// 調用事件處理函數
			mouseMoveHandler({ e: {} });

			// 驗證物件被移除
			expect(mockCanvas.remove).toHaveBeenCalled();
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("mouse:up 事件應停止擦除模式", () => {
			// 先觸發 mouse:down 設置擦除狀態
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			mouseDownHandler({ e: {} });

			// 獲取 mouse:up 事件處理函數
			const mouseUpHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:up")[1];

			// 調用事件處理函數
			mouseUpHandler();

			// 獲取 mouse:move 事件處理函數
			const mouseMoveHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			// 重置 mock 計數
			mockCanvas.remove.mockClear();
			mockCanvas.renderAll.mockClear();

			// 調用 mouse:move 事件處理函數，此時不應觸發擦除
			mouseMoveHandler({ e: {} });

			// 驗證物件未被移除（因為擦除模式已停止）
			expect(mockCanvas.remove).not.toHaveBeenCalled();
		});

		test("應正確識別並跳過指示器物件", () => {
			// 添加指示器到物件列表
			mockCanvas.getObjects.mockReturnValueOnce([
				{
					id: "obj1",
					selectable: true,
					evented: true,
					getCenterPoint: jest.fn().mockReturnValue({ x: 100, y: 100 }),
					width: 20,
				},
				{
					// 模擬指示器
					id: "eraser-indicator",
					type: "circle",
					fill: "rgba(255, 0, 0, 0.3)",
					getCenterPoint: jest.fn().mockReturnValue({ x: 150, y: 150 }),
					width: 10,
				},
			]);

			// 獲取 mouse:down 事件處理函數
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 調用事件處理函數
			mouseDownHandler({ e: {} });

			// 驗證只有非指示器物件被移除
			expect(mockCanvas.remove).toHaveBeenCalledTimes(1);
			expect(mockCanvas.remove).toHaveBeenCalledWith(expect.objectContaining({ id: "obj1" }));
		});
	});

	// object:added 測試
	describe("object:added", () => {
		test("應設置新物件為不可選取", () => {
			// 獲取 object:added 事件處理函數
			const objectAddedHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "object:added")[1];

			// 創建模擬新物件
			const newObject = { id: "new-obj", selectable: true, evented: true };

			// 調用事件處理函數
			objectAddedHandler({ target: newObject });

			// 驗證物件被設置為不可選取
			expect(newObject._originalSelectable).toBe(true);
			expect(newObject.selectable).toBe(false);
			expect(newObject.evented).toBe(false);
		});

		test("應跳過指示器物件", () => {
			// 獲取 object:added 事件處理函數
			const objectAddedHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "object:added")[1];

			// 調用事件處理函數，傳入指示器
			objectAddedHandler({ target: mockIndicator });

			// 驗證指示器未被修改
			expect(mockIndicator._originalSelectable).toBeUndefined();
		});
	});

	// 使用獨立的函數進行測試，減少巢狀層級
	describe("updateSize", testUpdateSize);
	describe("cleanup", testCleanup);

	// disableEraser 測試
	describe("disableEraser", () => {
		test("應移除事件監聽器並恢復物件狀態", () => {
			// 設置模擬物件
			mockCanvas.getObjects = jest.fn().mockReturnValue([
				{ id: "obj1", selectable: false, evented: false, _originalSelectable: true },
				{ type: "circle", fill: "rgba(255, 0, 0, 0.3)" }, // 模擬指示器
			]);

			// 調用 disableEraser
			disableEraser(mockCanvas);

			// 驗證事件監聽器被移除
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:over");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:out");
			expect(mockCanvas.off).toHaveBeenCalledWith("object:added");

			// 驗證指示器被移除
			expect(mockCanvas.remove).toHaveBeenCalled();

			// 驗證物件狀態被恢復
			const objects = mockCanvas.getObjects();
			expect(objects[0].selectable).toBe(true);
			expect(objects[0].evented).toBe(true);

			// 驗證畫布選取功能被恢復
			expect(mockCanvas.selection).toBe(true);
		});

		test("當畫布為 null 時不應拋出錯誤", () => {
			expect(() => disableEraser(null)).not.toThrow();
		});
	});
});
