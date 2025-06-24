jest.mock("../EraserIndicator", () => ({
	createEraserIndicator: jest.fn(),
	setupIndicatorEventListeners: jest.fn(),
}));

import * as PathEraserTools from "../PathEraserTools";
import { createEraserIndicator, setupIndicatorEventListeners } from "../EraserIndicator";

// Mock ClippingGroup 讓 instanceof 檢查可以正常工作
// class MockClippingGroup {}
function MockClippingGroup() {
	// 僅用於 instanceof 測試
}
global.ClippingGroup = MockClippingGroup;

describe("PathEraserTools", () => {
	let canvas, settings, eraserInstance, indicatorInstance, eventHandlers;

	beforeEach(() => {
		jest.clearAllMocks();

		// 設置 eraser instance mock - 更完整的 mock
		eraserInstance = {
			width: 20,
			on: jest.fn(),
			commit: jest.fn(() => Promise.resolve()),
			// 添加其他可能需要的屬性
			canvas: null,
			color: "rgba(255, 255, 255, 0.5)",
		};

		// 設置 indicator instance mock
		indicatorInstance = {
			set: jest.fn(),
			get: jest.fn(),
			type: "circle",
		};

		// 設置 event handlers mock
		eventHandlers = {
			removeListeners: jest.fn(),
		};

		// Mock 函數實作
		createEraserIndicator.mockImplementation(() => indicatorInstance);
		setupIndicatorEventListeners.mockImplementation(() => eventHandlers);

		// 設置更完整的 canvas mock
		canvas = {
			isDrawingMode: false,
			off: jest.fn(),
			on: jest.fn(),
			getObjects: jest.fn(() => []),
			freeDrawingBrush: null,
			renderAll: jest.fn(),
			remove: jest.fn(),
			add: jest.fn(),
			historyManager: {
				registerToolResetCallback: jest.fn(),
				unregisterToolResetCallback: jest.fn(),
				saveState: jest.fn(),
			},
		};

		settings = { size: 30 };

		// 設置全域變數給測試環境的 fallback 使用
		global.ClippingGroup = MockClippingGroup;
		global.__eraserInstance = eraserInstance;
	});

	// 清理全域變數
	afterEach(() => {
		delete global.__eraserInstance;
	});

	describe("setupPathEraser", () => {
		it("canvas 為 null 時應直接 return", () => {
			expect(PathEraserTools.setupPathEraser(null, settings)).toBeUndefined();
		});

		it("應正確設置橡皮擦工具的所有基本功能", () => {
			const result = PathEraserTools.setupPathEraser(canvas, settings);

			// 驗證基本設置
			expect(canvas.isDrawingMode).toBe(true);
			expect(eraserInstance.width).toBe(settings.size);
			expect(canvas.freeDrawingBrush).toBe(eraserInstance);

			// 驗證事件清理
			expect(canvas.off).toHaveBeenCalledWith("mouse:down");
			expect(canvas.off).toHaveBeenCalledWith("mouse:move");
			expect(canvas.off).toHaveBeenCalledWith("mouse:up");
			expect(canvas.off).toHaveBeenCalledWith("mouse:out");
			expect(canvas.off).toHaveBeenCalledWith("mouse:over");

			// 驗證事件監聽器設置
			expect(canvas.on).toHaveBeenCalledWith("path:created", expect.any(Function));
			expect(setupIndicatorEventListeners).toHaveBeenCalledWith(canvas, expect.any(Object), expect.any(Function));

			// 驗證歷史管理器註冊
			expect(canvas.historyManager.registerToolResetCallback).toHaveBeenCalledWith(expect.any(Function));

			// 驗證返回的介面
			expect(result).toEqual({
				updateSize: expect.any(Function),
				cleanup: expect.any(Function),
				reset: expect.any(Function),
				eraserIndicator: expect.any(Object),
			});
		});

		it("橡皮擦事件監聽器應正確設置", () => {
			PathEraserTools.setupPathEraser(canvas, settings);

			// 驗證橡皮擦事件監聽器
			expect(eraserInstance.on).toHaveBeenCalledWith("start", expect.any(Function));
			expect(eraserInstance.on).toHaveBeenCalledWith("end", expect.any(Function));
		});

		it("path:created 事件應將新路徑設為可擦除", () => {
			const pathObj = { type: "path", set: jest.fn() };
			canvas.getObjects.mockReturnValue([pathObj]);

			PathEraserTools.setupPathEraser(canvas, settings);

			// 執行 path:created 事件
			const pathCreatedCall = canvas.on.mock.calls.find(([event]) => event === "path:created");
			expect(pathCreatedCall).toBeDefined();

			pathCreatedCall[1](); // 執行回調
			expect(pathObj.set).toHaveBeenCalledWith("erasable", true);
		});

		it("橡皮擦 end 事件應正確處理擦除操作", async () => {
			PathEraserTools.setupPathEraser(canvas, settings);

			// 取得 end 事件回調
			const endCallback = eraserInstance.on.mock.calls.find(([event]) => event === "end")[1];
			const mockEvent = {
				detail: {
					path: { id: "test-path" },
					targets: [{ clipPath: new MockClippingGroup() }],
				},
			};

			await endCallback(mockEvent);

			// 驗證 commit 被正確呼叫
			expect(eraserInstance.commit).toHaveBeenCalledWith({
				path: mockEvent.detail.path,
				targets: mockEvent.detail.targets,
			});
			expect(canvas.renderAll).toHaveBeenCalled();
			expect(canvas.historyManager.saveState).toHaveBeenCalled();
		});

		it("橡皮擦 end 事件錯誤處理", async () => {
			// Mock console.error 來避免測試輸出
			const consoleSpy = jest.spyOn(console, "error").mockImplementation();

			eraserInstance.commit.mockRejectedValue(new Error("Commit failed"));
			PathEraserTools.setupPathEraser(canvas, settings);

			const endCallback = eraserInstance.on.mock.calls.find(([event]) => event === "end")[1];
			const mockEvent = {
				detail: { path: {}, targets: [] },
			};

			await endCallback(mockEvent);

			expect(consoleSpy).toHaveBeenCalledWith("擦除操作失敗:", expect.any(Error));
			consoleSpy.mockRestore();
		});

		it("updateSize 應正確更新橡皮擦和指示器大小", () => {
			const tool = PathEraserTools.setupPathEraser(canvas, settings);

			// 設置指示器存在
			tool.eraserIndicator.current = indicatorInstance;

			tool.updateSize(50);

			expect(eraserInstance.width).toBe(50);
			expect(indicatorInstance.set).toHaveBeenCalledWith({ radius: 25 });
			expect(canvas.renderAll).toHaveBeenCalled();
		});

		it("updateSize 在沒有指示器時應只更新橡皮擦大小", () => {
			const tool = PathEraserTools.setupPathEraser(canvas, settings);

			// 確保沒有指示器
			tool.eraserIndicator.current = null;

			tool.updateSize(50);

			expect(eraserInstance.width).toBe(50);
			expect(indicatorInstance.set).not.toHaveBeenCalled();
			expect(canvas.renderAll).not.toHaveBeenCalled();
		});

		it("cleanup 應正確清理所有資源", () => {
			const tool = PathEraserTools.setupPathEraser(canvas, settings);
			tool.eraserIndicator.current = indicatorInstance;

			tool.cleanup();

			expect(canvas.historyManager.unregisterToolResetCallback).toHaveBeenCalled();
			expect(eventHandlers.removeListeners).toHaveBeenCalled();
			expect(canvas.remove).toHaveBeenCalledWith(indicatorInstance);
			expect(tool.eraserIndicator.current).toBeNull();
		});

		it("reset 應重新創建橡皮擦並保持設定", () => {
			const originalWidth = 40;
			eraserInstance.width = originalWidth;

			const tool = PathEraserTools.setupPathEraser(canvas, settings);

			// 清除之前的呼叫記錄
			jest.clearAllMocks();

			tool.reset();

			// 驗證新的橡皮擦被設置
			expect(canvas.freeDrawingBrush).toBe(eraserInstance);
			// 驗證事件重新設置
			expect(eraserInstance.on).toHaveBeenCalledWith("start", expect.any(Function));
			expect(eraserInstance.on).toHaveBeenCalledWith("end", expect.any(Function));
		});
	});

	describe("disablePathEraser", () => {
		it("canvas 為 null 時應直接返回", () => {
			expect(PathEraserTools.disablePathEraser(null)).toBeUndefined();
		});

		it("應移除事件監聽器", () => {
			canvas.getObjects.mockReturnValue([]);

			PathEraserTools.disablePathEraser(canvas);

			expect(canvas.off).toHaveBeenCalledWith("mouse:move");
			expect(canvas.off).toHaveBeenCalledWith("mouse:over");
			expect(canvas.off).toHaveBeenCalledWith("mouse:out");
		});

		it("有指示器時應移除指示器並重新渲染", () => {
			const indicator = { type: "circle", fill: "rgba(255, 0, 0, 0.3)" };
			canvas.getObjects.mockReturnValue([indicator]);

			PathEraserTools.disablePathEraser(canvas);

			expect(canvas.remove).toHaveBeenCalledWith(indicator);
			expect(canvas.renderAll).toHaveBeenCalled();
		});

		it("沒有指示器時不應執行移除操作", () => {
			canvas.getObjects.mockReturnValue([]);

			PathEraserTools.disablePathEraser(canvas);

			expect(canvas.remove).not.toHaveBeenCalled();
			expect(canvas.renderAll).not.toHaveBeenCalled();
		});
	});

	describe("makeObjectErasable", () => {
		it("物件存在時應設置 erasable 屬性並返回物件", () => {
			const obj = { set: jest.fn() };
			const result = PathEraserTools.makeObjectErasable(obj);

			expect(result).toBe(obj);
			expect(obj.set).toHaveBeenCalledWith("erasable", true);
		});

		it("物件為 null 時應返回 undefined", () => {
			expect(PathEraserTools.makeObjectErasable(null)).toBeUndefined();
		});

		it("物件為 undefined 時應返回 undefined", () => {
			expect(PathEraserTools.makeObjectErasable(undefined)).toBeUndefined();
		});
	});

	describe("setAllObjectsErasable", () => {
		it("canvas 為 null 時應直接返回", () => {
			expect(PathEraserTools.setAllObjectsErasable(null)).toBeUndefined();
		});

		it("應將所有非指示器物件設為可擦除", () => {
			const obj1 = { type: "rect", fill: "#fff", set: jest.fn() };
			const obj2 = { type: "circle", fill: "rgba(255, 0, 0, 0.3)", set: jest.fn() }; // 指示器
			const obj3 = { type: "path", fill: "#000", set: jest.fn() };
			const obj4 = { type: "circle", fill: "#blue", set: jest.fn() }; // 非指示器的圓形

			canvas.getObjects.mockReturnValue([obj1, obj2, obj3, obj4]);

			PathEraserTools.setAllObjectsErasable(canvas);

			expect(obj1.set).toHaveBeenCalledWith("erasable", true);
			expect(obj2.set).not.toHaveBeenCalled(); // 指示器不應被設置
			expect(obj3.set).toHaveBeenCalledWith("erasable", true);
			expect(obj4.set).toHaveBeenCalledWith("erasable", true); // 非指示器圓形應被設置
		});

		it("空畫布時不應報錯", () => {
			canvas.getObjects.mockReturnValue([]);

			expect(() => {
				PathEraserTools.setAllObjectsErasable(canvas);
			}).not.toThrow();
		});
	});
});
