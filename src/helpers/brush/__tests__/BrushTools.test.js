import * as fabric from "fabric";
import { createBrush, setupBrushEventListeners } from "../BrushTools";
import { convertToRGBA } from "../../color/ColorConvert";

// 模擬 fabric.js
jest.mock("fabric", () => {
	// 創建模擬筆刷類
	const createMockBrush = () => ({
		color: null,
		width: 1,
		shadow: null,
		source: null,
	});

	return {
		PencilBrush: jest.fn().mockImplementation(() => createMockBrush()),
		PatternBrush: jest.fn().mockImplementation(() => createMockBrush()),
		CircleBrush: jest.fn().mockImplementation(() => createMockBrush()),
		SprayBrush: jest.fn().mockImplementation(() => createMockBrush()),
		Shadow: jest.fn().mockImplementation((options) => options),
	};
});

// 模擬 ColorConvert
jest.mock("../../color/ColorConvert", () => ({
	convertToRGBA: jest.fn().mockImplementation((color, opacity) => {
		if (!color) return `rgba(0, 0, 0, ${opacity})`;
		if (color.startsWith("rgba")) return color;
		return `rgba(255, 0, 0, ${opacity})`;
	}),
}));

describe("BrushTools 測試", () => {
	let mockCanvas;

	beforeEach(() => {
		// 重置所有 mock
		jest.clearAllMocks();

		// 創建模擬 canvas
		mockCanvas = {
			on: jest.fn(),
			off: jest.fn(),
			renderAll: jest.fn(),
			historyManager: {
				saveState: jest.fn(),
			},
			freeDrawingBrush: {
				color: null,
			},
			isDrawingMode: false,
		};
	});

	// 測試 createBrush 函數
	describe("createBrush", () => {
		test("當 canvas 為 null 時應返回 null", () => {
			const result = createBrush(null, "PencilBrush", { color: "#FF0000", opacity: 0.8 });
			expect(result).toBeNull();
		});

		test("應創建 PencilBrush 並設置正確屬性", () => {
			const settings = {
				color: "#FF0000",
				opacity: 0.8,
				size: "5",
			};

			const brush = createBrush(mockCanvas, "PencilBrush", settings);

			expect(fabric.PencilBrush).toHaveBeenCalledWith(mockCanvas);
			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#FF0000", 0.8);
			expect(brush.width).toBe(5);
		});

		test("應創建 PatternBrush 並設置正確屬性", () => {
			const settings = {
				color: "#00FF00",
				opacity: 0.6,
				size: "8",
			};

			const brush = createBrush(mockCanvas, "PatternBrush", settings);

			expect(fabric.PatternBrush).toHaveBeenCalledWith(mockCanvas);
			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#00FF00", 0.6);
			expect(brush.width).toBe(8);
			expect(brush.source).toBeDefined();
		});

		test("應創建 VLineBrush 和 HLineBrush", () => {
			const settings = {
				color: "#0000FF",
				opacity: 0.5,
				size: "3",
			};

			// 測試 VLineBrush
			const vBrush = createBrush(mockCanvas, "VLineBrush", settings);
			expect(fabric.PatternBrush).toHaveBeenCalledWith(mockCanvas);
			expect(vBrush.source).toBeDefined();

			// 測試 HLineBrush
			fabric.PatternBrush.mockClear();
			const hBrush = createBrush(mockCanvas, "HLineBrush", settings);
			expect(fabric.PatternBrush).toHaveBeenCalledWith(mockCanvas);
			expect(hBrush.source).toBeDefined();
		});

		test("當設置了陰影時應正確應用", () => {
			const settings = {
				color: "#FF0000",
				opacity: 0.8,
				size: "5",
				shadow: {
					blur: "4",
					offsetX: "2",
					offsetY: "3",
					color: "#000000",
				},
			};

			const brush = createBrush(mockCanvas, "PencilBrush", settings);

			expect(fabric.Shadow).toHaveBeenCalledWith({
				blur: 4,
				offsetX: 2,
				offsetY: 3,
				affectStroke: true,
				color: "#000000",
			});
			expect(brush.shadow).toBeDefined();
		});

		test("應使用默認值處理無效的設置", () => {
			// 未提供 size
			const brushNoSize = createBrush(mockCanvas, "PencilBrush", { color: "#FF0000", opacity: 0.8 });
			expect(brushNoSize.width).toBe(1);

			// 無效的筆刷類型應返回 PencilBrush
			fabric.PencilBrush.mockClear();
			const brushInvalidType = createBrush(mockCanvas, "InvalidBrushType", { color: "#FF0000", opacity: 0.8 });
			expect(fabric.PencilBrush).toHaveBeenCalled();
			expect(brushInvalidType).toBeDefined();
		});
	});

	// 測試 setupBrushEventListeners 函數
	describe("setupBrushEventListeners", () => {
		test("應移除然後添加 path:created 事件監聽器", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			setupBrushEventListeners(mockCanvas, settings);

			expect(mockCanvas.off).toHaveBeenCalledWith("path:created");
			expect(mockCanvas.on).toHaveBeenCalledWith("path:created", expect.any(Function));
		});

		test("應移除然後添加 mouse:down 事件監聽器", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			setupBrushEventListeners(mockCanvas, settings);

			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:down", expect.any(Function));
		});

		test("path:created 事件應呼叫 renderAll 和 saveState", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			setupBrushEventListeners(mockCanvas, settings);

			// 獲取註冊的 path:created 回調函數
			const pathCreatedCallback = mockCanvas.on.mock.calls.find(
				call => call[0] === "path:created"
			)[1];

			// 模擬觸發事件
			pathCreatedCallback({ path: {} });

			expect(mockCanvas.renderAll).toHaveBeenCalled();
			expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();
		});

		test("mouse:down 事件應更新筆刷顏色", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			mockCanvas.isDrawingMode = true;

			// 模擬 convertToRGBA 的返回值
			convertToRGBA.mockReturnValue("rgba(255, 0, 0, 0.8)");

			setupBrushEventListeners(mockCanvas, settings);

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find(
				call => call[0] === "mouse:down"
			)[1];

			// 模擬觸發事件
			mouseDownCallback();

			expect(convertToRGBA).toHaveBeenCalledWith("#FF0000", 0.8);
			expect(mockCanvas.freeDrawingBrush.color).toBe("rgba(255, 0, 0, 0.8)");
		});

		test("當 canvas 中沒有 historyManager 時不應拋出錯誤", () => {
			delete mockCanvas.historyManager;
			const settings = { color: "#FF0000", opacity: 0.8 };
			
			setupBrushEventListeners(mockCanvas, settings);
			
			// 獲取註冊的 path:created 回調函數
			const pathCreatedCallback = mockCanvas.on.mock.calls.find(
				call => call[0] === "path:created"
			)[1];
			
			// 應該不會拋出錯誤
			expect(() => pathCreatedCallback({ path: {} })).not.toThrow();
		});
	});
}); 