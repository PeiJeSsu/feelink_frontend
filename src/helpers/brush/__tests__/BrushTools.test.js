import * as fabric from "fabric";
import { createBrush, setupBrushEventListeners } from "../BrushTools";
import { convertToRGBA } from "../../color/ColorProcess";

// 模擬自定義筆刷
jest.mock("../custom-brushes/MarkerBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/ShadedBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/RibbonBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/LongfurBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/InkBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/FurBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/CrayonBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/SketchyBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/WebBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/SquaresBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

jest.mock("../custom-brushes/SpraypaintBrush", () => {
	return jest.fn().mockImplementation(() => ({
		color: null,
		width: 1,
		shadow: null,
	}));
});

// 模擬 fabric.js
jest.mock("fabric", () => {
	// 創建模擬筆刷類
	const createMockBrush = () => ({
		color: null,
		width: 1,
		shadow: null,
		source: null,
		density: null,
		dotWidth: null,
		randomOpacity: null,
		dotWidthVariance: null,
	});

	class BaseBrush {
		constructor() {}
	}

	class Point {
		constructor(x = 0, y = 0) {
			this.x = x;
			this.y = y;
		}
	}

	class Rect {
		constructor(options) {
			this.width = options.width;
			this.height = options.height;
			this.angle = options.angle;
			this.fill = options.fill;
		}

		getBoundingRect() {
			return { width: this.width };
		}

		set(options) {
			Object.assign(this, options);
		}

		render(ctx) {
			// 模擬渲染
		}
	}

	return {
		PencilBrush: jest.fn().mockImplementation(() => createMockBrush()),
		PatternBrush: jest.fn().mockImplementation(() => createMockBrush()),
		CircleBrush: jest.fn().mockImplementation(() => createMockBrush()),
		SprayBrush: jest.fn().mockImplementation(() => createMockBrush()),
		Shadow: jest.fn().mockImplementation((options) => options),
		BaseBrush,
		Point,
		Rect,
	};
});

// 模擬 ColorConvert
jest.mock("../../color/ColorProcess", () => ({
	convertToRGBA: jest.fn().mockImplementation((color, opacity) => {
		if (!color) return `rgba(0, 0, 0, ${opacity})`;
		if (color.startsWith("rgba")) return color;
		return `rgba(255, 0, 0, ${opacity})`;
	}),
}));

describe("BrushTools 測試", () => {
	let mockCanvas;
	let mockContext;

	beforeEach(() => {
		// 重置所有 mock
		jest.clearAllMocks();

		// 模擬 canvas context
		mockContext = {
			fillStyle: null,
			fillRect: jest.fn(),
			strokeStyle: null,
			lineWidth: null,
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			closePath: jest.fn(),
			stroke: jest.fn(),
		};

		// mock canvas
		global.document.createElement = jest.fn((tag) => {
			if (tag === "canvas") {
				return {
					width: 0,
					height: 0,
					getContext: jest.fn(() => mockContext),
				};
			}
			return {};
		});

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

		test("應創建 SquareBrush 並設置正確屬性", () => {
			const settings = {
				color: "#FF00FF",
				opacity: 0.7,
				size: "6",
			};

			const brush = createBrush(mockCanvas, "SquareBrush", settings);

			expect(fabric.PatternBrush).toHaveBeenCalledWith(mockCanvas);
			expect(brush).toBeDefined();
			expect(brush.source).toBeDefined();
			expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
		});

		test("應創建 DiamondBrush 並設置正確屬性", () => {
			const settings = {
				color: "#FFFF00",
				opacity: 0.9,
				size: "4",
			};

			const brush = createBrush(mockCanvas, "DiamondBrush", settings);

			expect(fabric.PatternBrush).toHaveBeenCalledWith(mockCanvas);
			expect(brush).toBeDefined();
			expect(brush.source).toBeDefined();
		});

		test("應創建 CircleBrush 並設置正確屬性", () => {
			const settings = {
				color: "#00FFFF",
				opacity: 0.4,
				size: "7",
			};

			const brush = createBrush(mockCanvas, "CircleBrush", settings);

			expect(fabric.CircleBrush).toHaveBeenCalledWith(mockCanvas);
			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#00FFFF", 0.4);
			expect(brush.width).toBe(7);
		});

		test("應創建 SprayBrush 並設置正確屬性", () => {
			const settings = {
				color: "#FF8000",
				opacity: 0.6,
				size: "10",
			};

			const brush = createBrush(mockCanvas, "SprayBrush", settings);

			expect(fabric.SprayBrush).toHaveBeenCalledWith(mockCanvas);
			expect(brush).toBeDefined();
			expect(brush.density).toBe(30);
			expect(brush.dotWidth).toBe(0.5); // 10 / 20
			expect(brush.randomOpacity).toBe(true);
			expect(brush.dotWidthVariance).toBe(1);
		});

		test("應創建自定義筆刷 MarkerBrush", () => {
			const settings = {
				color: "#8000FF",
				opacity: 0.8,
				size: "12",
			};

			const brush = createBrush(mockCanvas, "MarkerBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#8000FF", 0.8);
			expect(brush.width).toBe(12);
		});

		test("應創建自定義筆刷 ShadedBrush", () => {
			const settings = {
				color: "#FF0080",
				opacity: 0.5,
				size: "9",
			};

			const brush = createBrush(mockCanvas, "ShadedBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#FF0080", 0.5);
			expect(brush.width).toBe(9);
		});

		test("應創建自定義筆刷 RibbonBrush", () => {
			const settings = {
				color: "#80FF00",
				opacity: 0.7,
				size: "15",
			};

			const brush = createBrush(mockCanvas, "RibbonBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#80FF00", 0.7);
			expect(brush.width).toBe(15);
		});

		test("應創建自定義筆刷 LongfurBrush", () => {
			const settings = {
				color: "#0080FF",
				opacity: 0.6,
				size: "11",
			};

			const brush = createBrush(mockCanvas, "LongfurBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#0080FF", 0.6);
			expect(brush.width).toBe(11);
		});

		test("應創建自定義筆刷 InkBrush", () => {
			const settings = {
				color: "#FF8080",
				opacity: 0.9,
				size: "8",
			};

			const brush = createBrush(mockCanvas, "InkBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#FF8080", 0.9);
			expect(brush.width).toBe(8);
		});

		test("應創建自定義筆刷 FurBrush", () => {
			const settings = {
				color: "#80FF80",
				opacity: 0.4,
				size: "13",
			};

			const brush = createBrush(mockCanvas, "FurBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#80FF80", 0.4);
			expect(brush.width).toBe(13);
		});

		test("應創建自定義筆刷 CrayonBrush", () => {
			const settings = {
				color: "#8080FF",
				opacity: 0.7,
				size: "6",
			};

			const brush = createBrush(mockCanvas, "CrayonBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#8080FF", 0.7);
			expect(brush.width).toBe(6);
		});

		test("應創建自定義筆刷 SketchyBrush", () => {
			const settings = {
				color: "#FFFF80",
				opacity: 0.5,
				size: "14",
			};

			const brush = createBrush(mockCanvas, "SketchyBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#FFFF80", 0.5);
			expect(brush.width).toBe(14);
		});

		test("應創建自定義筆刷 WebBrush", () => {
			const settings = {
				color: "#80FFFF",
				opacity: 0.8,
				size: "10",
			};

			const brush = createBrush(mockCanvas, "WebBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#80FFFF", 0.8);
			expect(brush.width).toBe(10);
		});

		test("應創建自定義筆刷 SquaresBrush", () => {
			const settings = {
				color: "#FF80FF",
				opacity: 0.6,
				size: "16",
			};

			const brush = createBrush(mockCanvas, "SquaresBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#FF80FF", 0.6);
			expect(brush.width).toBe(16);
		});

		test("應創建自定義筆刷 SpraypaintBrush", () => {
			const settings = {
				color: "#80FF80",
				opacity: 0.7,
				size: "18",
			};

			const brush = createBrush(mockCanvas, "SpraypaintBrush", settings);

			expect(brush).toBeDefined();
			expect(convertToRGBA).toHaveBeenCalledWith("#80FF80", 0.7);
			expect(brush.width).toBe(18);
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

		test("當設置了陰影但缺少某些屬性時應使用默認值", () => {
			const settings = {
				color: "#FF0000",
				opacity: 0.8,
				size: "5",
				shadow: {
					blur: "invalid",
					offsetX: "invalid",
					offsetY: "invalid",
				},
			};

			const brush = createBrush(mockCanvas, "PencilBrush", settings);

			expect(fabric.Shadow).toHaveBeenCalledWith({
				blur: 0,
				offsetX: 0,
				offsetY: 0,
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

	// 測試 createPatternCanvas 函數的各種情況
	describe("createPatternCanvas", () => {
		test("應正確創建 PatternBrush 的 pattern canvas", () => {
			const settings = {
				color: "#FF0000",
				opacity: 0.8,
			};

			createBrush(mockCanvas, "PatternBrush", settings);

			expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 5, 5);
			expect(mockContext.fillRect).toHaveBeenCalledWith(5, 5, 5, 5);
		});

		test("應正確創建 VLineBrush 的 pattern canvas", () => {
			const settings = {
				color: "#00FF00",
				opacity: 0.6,
			};

			createBrush(mockCanvas, "VLineBrush", settings);

			expect(mockContext.beginPath).toHaveBeenCalled();
			expect(mockContext.moveTo).toHaveBeenCalledWith(0, 5);
			expect(mockContext.lineTo).toHaveBeenCalledWith(10, 5);
			expect(mockContext.closePath).toHaveBeenCalled();
			expect(mockContext.stroke).toHaveBeenCalled();
		});

		test("應正確創建 HLineBrush 的 pattern canvas", () => {
			const settings = {
				color: "#0000FF",
				opacity: 0.5,
			};

			createBrush(mockCanvas, "HLineBrush", settings);

			expect(mockContext.beginPath).toHaveBeenCalled();
			expect(mockContext.moveTo).toHaveBeenCalledWith(5, 0);
			expect(mockContext.lineTo).toHaveBeenCalledWith(5, 10);
			expect(mockContext.closePath).toHaveBeenCalled();
			expect(mockContext.stroke).toHaveBeenCalled();
		});

		test("應正確創建 SquareBrush 的 pattern canvas", () => {
			const settings = {
				color: "#FF00FF",
				opacity: 0.7,
			};

			createBrush(mockCanvas, "SquareBrush", settings);

			expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
		});

		test("應正確創建 DiamondBrush 的 pattern canvas", () => {
			const settings = {
				color: "#FFFF00",
				opacity: 0.9,
			};

			expect(() => createBrush(mockCanvas, "DiamondBrush", settings)).not.toThrow();
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
			const pathCreatedCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "path:created")[1];

			// 模擬觸發事件
			pathCreatedCallback({ path: {} });

			expect(mockCanvas.renderAll).toHaveBeenCalled();
			expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();
		});

		test("path:created 事件當沒有 path 時不應呼叫 renderAll 和 saveState", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			setupBrushEventListeners(mockCanvas, settings);

			// 獲取註冊的 path:created 回調函數
			const pathCreatedCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "path:created")[1];

			// 模擬觸發事件，沒有 path
			pathCreatedCallback({});

			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
			expect(mockCanvas.historyManager.saveState).not.toHaveBeenCalled();
		});

		test("mouse:down 事件應更新筆刷顏色", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			mockCanvas.isDrawingMode = true;

			// 模擬 convertToRGBA 的返回值
			convertToRGBA.mockReturnValue("rgba(255, 0, 0, 0.8)");

			setupBrushEventListeners(mockCanvas, settings);

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬觸發事件
			mouseDownCallback();

			expect(convertToRGBA).toHaveBeenCalledWith("#FF0000", 0.8);
			expect(mockCanvas.freeDrawingBrush.color).toBe("rgba(255, 0, 0, 0.8)");
		});

		test("mouse:down 事件當不在繪圖模式時不應更新筆刷顏色", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			mockCanvas.isDrawingMode = false;

			setupBrushEventListeners(mockCanvas, settings);

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬觸發事件
			mouseDownCallback();

			expect(convertToRGBA).not.toHaveBeenCalled();
		});

		test("mouse:down 事件當沒有 freeDrawingBrush 時不應更新筆刷顏色", () => {
			const settings = { color: "#FF0000", opacity: 0.8 };
			mockCanvas.isDrawingMode = true;
			mockCanvas.freeDrawingBrush = null;

			setupBrushEventListeners(mockCanvas, settings);

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬觸發事件
			mouseDownCallback();

			expect(convertToRGBA).not.toHaveBeenCalled();
		});

		test("當 canvas 中沒有 historyManager 時不應拋出錯誤", () => {
			delete mockCanvas.historyManager;
			const settings = { color: "#FF0000", opacity: 0.8 };

			setupBrushEventListeners(mockCanvas, settings);

			// 獲取註冊的 path:created 回調函數
			const pathCreatedCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "path:created")[1];

			// 應該不會拋出錯誤
			expect(() => pathCreatedCallback({ path: {} })).not.toThrow();
		});
	});
});
