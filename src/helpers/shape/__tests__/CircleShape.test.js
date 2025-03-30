import * as fabric from "fabric";
import { handleMouseDownCircle, handleMouseMoveCircle, isTooSmallCircle } from "../CircleShape";

// 模擬 uuid
jest.mock("uuid", () => ({
	v4: jest.fn().mockReturnValue("mock-uuid-123"),
}));

// 模擬 fabric.js
jest.mock("fabric", () => {
	const mockCircle = {
		set: jest.fn().mockReturnThis(),
		radius: 10,
	};

	return {
		Circle: jest.fn().mockImplementation(() => mockCircle),
	};
});

describe("CircleShape 測試", () => {
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

	describe("handleMouseDownCircle", () => {
		test("應創建並返回新的圓形", () => {
			const circle = handleMouseDownCircle(mockEvent, mockCanvas, mockSettings);

			// 確認創建了圓形
			expect(fabric.Circle).toHaveBeenCalledWith(
				expect.objectContaining({
					left: 100,
					top: 100,
					originX: "center",
					originY: "center",
					radius: 0,
					fill: "#FF0000",
					stroke: "#000000",
					strokeWidth: 2,
					opacity: 0.8,
					selectable: false,
					hasControls: false,
				})
			);

			// 確認將圓形添加到畫布
			expect(mockCanvas.add).toHaveBeenCalled();

			// 確認返回了創建的圓形
			expect(circle).toBeDefined();
		});

		test("應使用畫布上的鼠標位置", () => {
			handleMouseDownCircle(mockEvent, mockCanvas, mockSettings);

			expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e);
		});
	});

	describe("handleMouseMoveCircle", () => {
		test("如果形狀未定義，應提前返回", () => {
			handleMouseMoveCircle(mockEvent, mockCanvas, null, { x: 50, y: 50 });

			// 不應有任何畫布操作
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});

		test("應基於鼠標移動和起始點更新圓形", () => {
			// 創建模擬形狀
			const mockShape = {
				set: jest.fn().mockReturnThis(),
			};

			// 設置不同的指針位置模擬鼠標移動
			mockCanvas.getPointer.mockReturnValue({ x: 200, y: 200 });

			// 設置起始點
			const origin = { x: 100, y: 100 };

			// 調用測試函數
			handleMouseMoveCircle(mockEvent, mockCanvas, mockShape, origin);

			// 預期半徑計算：Math.sqrt((200-100)^2 + (200-100)^2) / 2 = 70.71/2 ≈ 35.36
			// 預期位置：(100+200)/2, (100+200)/2 = 150, 150
			expect(mockShape.set).toHaveBeenCalledWith(
				expect.objectContaining({
					left: 150,
					top: 150,
					radius: expect.any(Number),
				})
			);

			// 確認更新了畫布
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});

	describe("isTooSmallCircle", () => {
		test("半徑小於 5 時應返回 true", () => {
			const smallCircle = { radius: 3 };
			expect(isTooSmallCircle(smallCircle)).toBe(true);
		});

		test("半徑大於等於 5 時應返回 false", () => {
			const largeCircle = { radius: 10 };
			expect(isTooSmallCircle(largeCircle)).toBe(false);

			const boundaryCircle = { radius: 5 };
			expect(isTooSmallCircle(boundaryCircle)).toBe(false);
		});
	});
});
