import * as fabric from "fabric";
import { handleMouseDownLine, handleMouseMoveLine, isTooSmallLine } from "../LineShape";

// 模擬 uuid
jest.mock("uuid", () => ({
	v4: jest.fn().mockReturnValue("mock-uuid-123"),
}));

// 模擬 fabric.js
jest.mock("fabric", () => {
	const mockLine = {
		set: jest.fn().mockReturnThis(),
		width: 100,
	};

	return {
		Line: jest.fn().mockImplementation(() => mockLine),
	};
});

describe("LineShape 測試", () => {
	let mockCanvas;
	let mockEvent;
	let mockSettings;

	beforeEach(() => {
		// 重置所有 mock
		jest.clearAllMocks();

		// 創建模擬 canvas
		mockCanvas = {
			add: jest.fn(),
			renderAll: jest.fn(),
			getPointer: jest.fn().mockReturnValue({ x: 100, y: 100 }),
		};

		// 模擬事件物件
		mockEvent = {
			e: { type: "mousedown" },
		};

		// 模擬形狀設置
		mockSettings = {
			stroke: "#000000",
			strokeWidth: 2,
			opacity: 0.8,
		};
	});

	describe("handleMouseDownLine", () => {
		test("應創建並返回新的線條", () => {
			const line = handleMouseDownLine(mockEvent, mockCanvas, mockSettings);

			// 確認創建了線條
			expect(fabric.Line).toHaveBeenCalledWith(
				[100, 100, 100, 100], // 起始點和終點相同
				expect.objectContaining({
					stroke: "#000000",
					strokeWidth: 2,
					opacity: 0.8,
					selectable: false,
					hasControls: false,
				})
			);

			// 確認將線條添加到畫布
			expect(mockCanvas.add).toHaveBeenCalled();

			// 確認返回了創建的線條
			expect(line).toBeDefined();
		});

		test("應使用畫布上的鼠標位置", () => {
			handleMouseDownLine(mockEvent, mockCanvas, mockSettings);

			expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e);
		});
	});

	describe("handleMouseMoveLine", () => {
		test("如果形狀未定義，應提前返回", () => {
			handleMouseMoveLine(mockEvent, mockCanvas, null, { x: 50, y: 50 });

			// 不應有任何畫布操作
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});

		test("應基於鼠標移動更新線條的終點", () => {
			// 創建模擬形狀
			const mockShape = {
				set: jest.fn().mockReturnThis(),
			};

			// 設置不同的指針位置模擬鼠標移動
			mockCanvas.getPointer.mockReturnValue({ x: 200, y: 150 });

			// 設置起始點
			const origin = { x: 100, y: 100 };

			// 調用測試函數
			handleMouseMoveLine(mockEvent, mockCanvas, mockShape, origin);

			// 驗證線條的終點更新
			expect(mockShape.set).toHaveBeenCalledWith(
				expect.objectContaining({
					x2: 200,
					y2: 150,
				})
			);

			// 確認更新了畫布
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});

	describe("isTooSmallLine", () => {
		test("當線條長度小於 5 時應返回 true", () => {
			// 模擬一條短線 (x1,y1) 到 (x2,y2)
			const shortLine = {
				x1: 10,
				y1: 10,
				x2: 12,
				y2: 12,
			};
			// 計算的距離約為 2.8，應該被視為太小
			expect(isTooSmallLine(shortLine)).toBe(true);
		});

		test("當線條長度大於等於 5 時應返回 false", () => {
			// 模擬一條足夠長的線
			const longLine = {
				x1: 10,
				y1: 10,
				x2: 20,
				y2: 10,
			};
			// 水平線，長度為 10
			expect(isTooSmallLine(longLine)).toBe(false);

			// 邊界情況，剛好為 5 單位長
			const boundaryLine = {
				x1: 10,
				y1: 10,
				x2: 15,
				y2: 10,
			};
			expect(isTooSmallLine(boundaryLine)).toBe(false);
		});
	});
});
