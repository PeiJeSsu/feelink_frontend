import * as fabric from "fabric";
import { handleMouseDownTriangle, handleMouseMoveTriangle, isTooSmallTriangle } from "../TriangleShape";

// 模擬 uuid
jest.mock("uuid", () => ({
	v4: jest.fn().mockReturnValue("mock-uuid-123"),
}));

// 模擬 fabric.js
jest.mock("fabric", () => {
	const mockTriangle = {
		set: jest.fn().mockReturnThis(),
		width: 10,
		height: 8,
	};

	return {
		Triangle: jest.fn().mockImplementation(() => mockTriangle),
	};
});

describe("TriangleShape 測試", () => {
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

	describe("handleMouseDownTriangle", () => {
		test("應創建並返回新的三角形", () => {
			const triangle = handleMouseDownTriangle(mockEvent, mockCanvas, mockSettings);

			// 確認創建了三角形，但不檢查 id 屬性
			expect(fabric.Triangle).toHaveBeenCalledWith(
				expect.objectContaining({
					left: 100,
					top: 100,
					width: 0,
					height: 0,
					fill: "#FF0000",
					stroke: "#000000",
					strokeWidth: 2,
					opacity: 0.8,
					selectable: false,
					hasControls: false,
				})
			);

			// 確認將三角形添加到畫布
			expect(mockCanvas.add).toHaveBeenCalled();

			// 確認返回了創建的三角形
			expect(triangle).toBeDefined();
		});

		test("應使用畫布上的鼠標位置", () => {
			handleMouseDownTriangle(mockEvent, mockCanvas, mockSettings);

			expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e);
		});
	});

	describe("handleMouseMoveTriangle", () => {
		test("如果形狀未定義，應提前返回", () => {
			handleMouseMoveTriangle(mockEvent, mockCanvas, null, { x: 50, y: 50 });

			// 不應有任何畫布操作
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});

		test("應基於鼠標移動和起始點更新三角形", () => {
			// 創建模擬形狀
			const mockShape = {
				set: jest.fn().mockReturnThis(),
			};

			// 設置不同的指針位置模擬鼠標移動
			mockCanvas.getPointer.mockReturnValue({ x: 200, y: 150 });

			// 設置起始點
			const origin = { x: 100, y: 100 };

			// 調用測試函數
			handleMouseMoveTriangle(mockEvent, mockCanvas, mockShape, origin);

			// 驗證三角形的寬度和高度更新
			// 寬度預期為 |origin.x - pointer.x| * 2 = 200
			// 高度預期為 |origin.y - pointer.y| = 50
			expect(mockShape.set).toHaveBeenCalledWith(
				expect.objectContaining({
					width: 200,
					height: 50,
				})
			);

			// 確認更新了畫布
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("當鼠標在起始點左側時應更新左邊界", () => {
			const mockShape = {
				set: jest.fn().mockReturnThis(),
			};

			// 模擬鼠標移動到起始點左側
			mockCanvas.getPointer.mockReturnValue({ x: 50, y: 100 });

			const origin = { x: 100, y: 100 };

			handleMouseMoveTriangle(mockEvent, mockCanvas, mockShape, origin);

			// 驗證左邊界設置為當前鼠標位置
			expect(mockShape.set).toHaveBeenCalledWith(
				expect.objectContaining({
					left: 50,
				})
			);
		});

		test("當鼠標在起始點上方時應更新上邊界", () => {
			const mockShape = {
				set: jest.fn().mockReturnThis(),
			};

			// 模擬鼠標移動到起始點上方
			mockCanvas.getPointer.mockReturnValue({ x: 100, y: 50 });

			const origin = { x: 100, y: 100 };

			handleMouseMoveTriangle(mockEvent, mockCanvas, mockShape, origin);

			// 驗證上邊界設置為當前鼠標位置
			expect(mockShape.set).toHaveBeenCalledWith(
				expect.objectContaining({
					top: 50,
				})
			);
		});
	});

	describe("isTooSmallTriangle", () => {
		test("當寬度或高度小於 5 時應返回 true", () => {
			const smallWidthTriangle = { width: 3, height: 10 };
			expect(isTooSmallTriangle(smallWidthTriangle)).toBe(true);

			const smallHeightTriangle = { width: 10, height: 3 };
			expect(isTooSmallTriangle(smallHeightTriangle)).toBe(true);

			const smallBothTriangle = { width: 3, height: 4 };
			expect(isTooSmallTriangle(smallBothTriangle)).toBe(true);
		});

		test("當寬度和高度都大於等於 5 時應返回 false", () => {
			const largeTriangle = { width: 10, height: 8 };
			expect(isTooSmallTriangle(largeTriangle)).toBe(false);

			const boundaryTriangle = { width: 5, height: 5 };
			expect(isTooSmallTriangle(boundaryTriangle)).toBe(false);
		});
	});
});
