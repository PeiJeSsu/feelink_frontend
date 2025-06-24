import * as fabric from "fabric";
import {
	createEraserIndicator,
	updateIndicatorPosition,
	removeIndicator,
	setupIndicatorEventListeners,
} from "../EraserIndicator";

// 模擬 fabric.js
jest.mock("fabric", () => {
	const mockCircle = {
		set: jest.fn().mockReturnThis(),
		left: 0,
		top: 0,
	};

	return {
		Circle: jest.fn().mockImplementation(() => mockCircle),
	};
});

describe("EraserIndicator", () => {
	let mockCanvas;
	let mockIndicator;
	let mockPointer;

	beforeEach(() => {
		// 重置所有 mock
		jest.clearAllMocks();

		// 創建模擬畫布
		mockCanvas = {
			add: jest.fn(),
			remove: jest.fn(),
			renderAll: jest.fn(),
			on: jest.fn(),
			off: jest.fn(),
			getPointer: jest.fn().mockReturnValue({ x: 100, y: 100 }),
		};

		// 創建模擬指示器
		mockIndicator = {
			id: "test-indicator",
			set: jest.fn(),
		};

		// 創建模擬指標位置
		mockPointer = { x: 100, y: 100 };
	});

	describe("createEraserIndicator", () => {
		test("應創建並返回帶有正確屬性的圓形指示器", () => {
			const size = 20;
			const fillColor = "rgba(255, 0, 0, 0.3)";
			const strokeColor = "red";

			// 創建指示器
			const indicator = createEraserIndicator(mockCanvas, mockPointer, size, fillColor, strokeColor);

			// 驗證 Circle 建構函數被調用，且傳入了正確的參數
			expect(fabric.Circle).toHaveBeenCalledWith(
				expect.objectContaining({
					left: mockPointer.x,
					top: mockPointer.y,
					radius: size / 2,
					fill: fillColor,
					stroke: strokeColor,
					strokeWidth: 1,
					originX: "center",
					originY: "center",
					selectable: false,
					evented: false,
				})
			);

			// 驗證指示器被添加到畫布
			expect(mockCanvas.add).toHaveBeenCalled();
			expect(mockCanvas.renderAll).toHaveBeenCalled();

			// 驗證返回了指示器
			expect(indicator).toBeDefined();
		});

		test("應使用預設顏色參數", () => {
			// 只提供必要參數
			createEraserIndicator(mockCanvas, mockPointer, 20);

			// 驗證使用了預設值
			expect(fabric.Circle).toHaveBeenCalledWith(
				expect.objectContaining({
					fill: "rgba(255, 0, 0, 0.3)",
					stroke: "red",
				})
			);
		});
	});

	describe("updateIndicatorPosition", () => {
		test("應更新指示器位置並重新渲染畫布", () => {
			const newPointer = { x: 150, y: 200 };

			updateIndicatorPosition(mockCanvas, mockIndicator, newPointer);

			// 驗證指示器的位置被更新
			expect(mockIndicator.set).toHaveBeenCalledWith({
				left: newPointer.x,
				top: newPointer.y,
			});

			// 驗證畫布被重新渲染
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("當指示器為 null 時應提前返回", () => {
			updateIndicatorPosition(mockCanvas, null, mockPointer);

			// 驗證沒有執行後續操作
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});
	});

	describe("removeIndicator", () => {
		test("應從畫布中移除指示器並重新渲染", () => {
			removeIndicator(mockCanvas, mockIndicator);

			// 驗證指示器被移除
			expect(mockCanvas.remove).toHaveBeenCalledWith(mockIndicator);
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("當指示器為 null 時應提前返回", () => {
			removeIndicator(mockCanvas, null);

			// 驗證沒有執行後續操作
			expect(mockCanvas.remove).not.toHaveBeenCalled();
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});
	});

	describe("setupIndicatorEventListeners", () => {
		test("應設置事件監聽器並返回移除監聽器的函數", () => {
			// 創建指示器參考
			const indicatorRef = { current: null };
			// 創建指示器創建函數
			const createIndicator = jest.fn().mockReturnValue(mockIndicator);

			// 設置事件監聽器
			const result = setupIndicatorEventListeners(mockCanvas, indicatorRef, createIndicator);

			// 驗證事件監聽器被設置
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:move", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:out", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:over", expect.any(Function));

			// 驗證返回了移除監聽器的函數
			expect(result).toHaveProperty("removeListeners");
			expect(typeof result.removeListeners).toBe("function");
		});

		test("移除監聽器的函數應該移除所有事件監聽器", () => {
			const indicatorRef = { current: null };
			const createIndicator = jest.fn();

			// 設置事件監聽器並獲取移除函數
			const { removeListeners } = setupIndicatorEventListeners(mockCanvas, indicatorRef, createIndicator);

			// 調用移除函數
			removeListeners();

			// 驗證事件監聽器被移除
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:over");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:out");
		});

		test("mouse:move 事件應更新指示器位置", () => {
			const indicatorRef = { current: mockIndicator };
			const createIndicator = jest.fn();

			// 設置事件監聽器
			setupIndicatorEventListeners(mockCanvas, indicatorRef, createIndicator);

			// 獲取 mouse:move 事件處理函數
			const mouseMoveHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			// 調用事件處理函數
			mouseMoveHandler({ e: {} });

			// 驗證指示器位置被更新
			expect(mockIndicator.set).toHaveBeenCalledWith({
				left: mockPointer.x,
				top: mockPointer.y,
			});
		});

		test("mouse:out 事件應移除指示器", () => {
			const indicatorRef = { current: mockIndicator };
			const createIndicator = jest.fn();

			// 設置事件監聽器
			setupIndicatorEventListeners(mockCanvas, indicatorRef, createIndicator);

			// 獲取 mouse:out 事件處理函數
			const mouseOutHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:out")[1];

			// 調用事件處理函數
			mouseOutHandler();

			// 驗證指示器被移除
			expect(mockCanvas.remove).toHaveBeenCalledWith(mockIndicator);
			expect(indicatorRef.current).toBeNull();
		});

		test("mouse:over 事件應創建新指示器", () => {
			const indicatorRef = { current: null };
			const createIndicator = jest.fn().mockReturnValue(mockIndicator);

			// 設置事件監聽器
			setupIndicatorEventListeners(mockCanvas, indicatorRef, createIndicator);

			// 獲取 mouse:over 事件處理函數
			const mouseOverHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:over")[1];

			// 調用事件處理函數
			mouseOverHandler({ e: {} });

			// 驗證創建了新指示器
			expect(createIndicator).toHaveBeenCalledWith(mockPointer);
			expect(indicatorRef.current).toBe(mockIndicator);
		});

		test("mouse:move 事件在指示器不存在時應提前返回", () => {
			// 重置 getPointer 的模擬實現，以便我們可以檢測它是否被調用
			mockCanvas.getPointer.mockClear();

			const indicatorRef = { current: null };
			const createIndicator = jest.fn();

			// 設置事件監聽器
			setupIndicatorEventListeners(mockCanvas, indicatorRef, createIndicator);

			// 獲取 mouse:move 事件處理函數
			const mouseMoveHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			// 調用事件處理函數
			mouseMoveHandler({ e: {} });

			// 驗證沒有執行後續代碼 (如 getPointer)
			expect(mockCanvas.getPointer).not.toHaveBeenCalled();
		});

		// 額外測試：canvas 為 null 的邊界情況
		test("當 canvas 為 null 時應拋出 TypeError", () => {
			const indicatorRef = { current: null };
			const createIndicator = jest.fn();

			// 驗證提供 null canvas 會拋出 TypeError
			expect(() => {
				setupIndicatorEventListeners(null, indicatorRef, createIndicator);
			}).toThrow(TypeError);

			// 更具體地，驗證錯誤訊息包含特定文字
			expect(() => {
				setupIndicatorEventListeners(null, indicatorRef, createIndicator);
			}).toThrow("Cannot read properties of null");
		});
	});
});
