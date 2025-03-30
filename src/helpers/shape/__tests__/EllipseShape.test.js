import * as fabric from "fabric";
import { handleMouseDownEllipse, handleMouseMoveEllipse, isTooSmallEllipse } from "../EllipseShape";

// 模擬 uuid
jest.mock("uuid", () => ({
	v4: jest.fn().mockReturnValue("mock-uuid-123"),
}));

// 模擬 fabric.js
jest.mock("fabric", () => {
	const mockEllipse = {
		set: jest.fn().mockReturnThis(),
		rx: 10,
		ry: 8,
	};

	return {
		Ellipse: jest.fn().mockImplementation(() => mockEllipse),
	};
});

describe("EllipseShape 測試", () => {
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
			fill: "#FF0000",
			stroke: "#000000",
			strokeWidth: 2,
			opacity: 0.8,
		};
	});

	describe("handleMouseDownEllipse", () => {
		test("應創建並返回新的橢圓形", () => {
			const ellipse = handleMouseDownEllipse(mockEvent, mockCanvas, mockSettings);

			// 確認創建了橢圓形
			expect(fabric.Ellipse).toHaveBeenCalledWith(
				expect.objectContaining({
					left: 100,
					top: 100,
					originX: "center",
					originY: "center",
					rx: 0,
					ry: 0,
					fill: "#FF0000",
					stroke: "#000000",
					strokeWidth: 2,
					opacity: 0.8,
					selectable: false,
					hasControls: false,
				})
			);

			// 確認將橢圓形添加到畫布
			expect(mockCanvas.add).toHaveBeenCalled();

			// 確認返回了創建的橢圓形
			expect(ellipse).toBeDefined();
		});

		test("應使用畫布上的鼠標位置", () => {
			handleMouseDownEllipse(mockEvent, mockCanvas, mockSettings);

			expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e);
		});
	});

	describe("handleMouseMoveEllipse", () => {
		test("如果形狀未定義，應提前返回", () => {
			handleMouseMoveEllipse(mockEvent, mockCanvas, null, { x: 50, y: 50 });

			// 不應有任何畫布操作
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});

		test("應基於鼠標移動和起始點更新橢圓形", () => {
			// 創建模擬形狀
			const mockShape = {
				set: jest.fn().mockReturnThis(),
			};

			// 設置不同的指針位置模擬鼠標移動
			mockCanvas.getPointer.mockReturnValue({ x: 200, y: 150 });

			// 設置起始點
			const origin = { x: 100, y: 100 };

			// 調用測試函數
			handleMouseMoveEllipse(mockEvent, mockCanvas, mockShape, origin);

			// 預期半徑計算：
			// rx = |200-100|/2 = 50
			// ry = |150-100|/2 = 25
			// 預期位置：(100+200)/2, (100+150)/2 = 150, 125
			expect(mockShape.set).toHaveBeenCalledWith(
				expect.objectContaining({
					left: 150,
					top: 125,
					rx: 50,
					ry: 25,
				})
			);

			// 確認更新了畫布
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});

	describe("isTooSmallEllipse", () => {
		test("當 rx 或 ry 小於 5 時應返回 true", () => {
			const smallRxEllipse = { rx: 3, ry: 10 };
			expect(isTooSmallEllipse(smallRxEllipse)).toBe(true);

			const smallRyEllipse = { rx: 10, ry: 3 };
			expect(isTooSmallEllipse(smallRyEllipse)).toBe(true);

			const smallBothEllipse = { rx: 3, ry: 4 };
			expect(isTooSmallEllipse(smallBothEllipse)).toBe(true);
		});

		test("當 rx 和 ry 都大於等於 5 時應返回 false", () => {
			const largeEllipse = { rx: 10, ry: 8 };
			expect(isTooSmallEllipse(largeEllipse)).toBe(false);

			const boundaryEllipse = { rx: 5, ry: 5 };
			expect(isTooSmallEllipse(boundaryEllipse)).toBe(false);
		});
	});
});
