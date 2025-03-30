import { handleWheelZoom, zoomIn, zoomOut, setZoomLevel, resetCanvasView, MIN_ZOOM, MAX_ZOOM } from "../ZoomHelper";

describe("ZoomHelper", () => {
	// 模擬 canvas 物件
	let mockCanvas;

	beforeEach(() => {
		// 創建模擬 canvas
		mockCanvas = {
			getZoom: jest.fn(() => 1),
			zoomToPoint: jest.fn(),
			setZoom: jest.fn(),
			setViewportTransform: jest.fn(),
			renderAll: jest.fn(),
			width: 800,
			height: 600,
			zoomLevel: 1,
		};
	});

	// 測試 handleWheelZoom 函數
	describe("handleWheelZoom", () => {
		test("當 canvas 為 null 時應直接返回", () => {
			const result = handleWheelZoom(null, { e: { deltaY: 100 } });
			expect(result).toBeUndefined();
		});

		test("應正確限制縮放範圍", () => {
			// 測試縮小超過最小值的情況
			mockCanvas.getZoom.mockReturnValue(MIN_ZOOM + 0.1); // 設為略高於最小值

			const shrinkOpt = {
				e: {
					deltaY: 100, // 縮小 (想要縮小到 MIN_ZOOM)
					offsetX: 400,
					offsetY: 300,
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				},
			};

			handleWheelZoom(mockCanvas, shrinkOpt);

			// 檢查是否被限制在最小值
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, MIN_ZOOM);

			// 重置 mock
			mockCanvas.zoomToPoint.mockClear();

			// 測試放大超過最大值的情況
			mockCanvas.getZoom.mockReturnValue(MAX_ZOOM - 0.1); // 設為略低於最大值

			const enlargeOpt = {
				e: {
					deltaY: -100, // 放大 (想要放大到 MAX_ZOOM)
					offsetX: 400,
					offsetY: 300,
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				},
			};

			handleWheelZoom(mockCanvas, enlargeOpt);

			// 檢查是否被限制在最大值
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, MAX_ZOOM);
		});

		test("應正確計算放大縮放", () => {
			mockCanvas.getZoom.mockReturnValue(1);

			const opt = {
				e: {
					deltaY: -100,
					offsetX: 400,
					offsetY: 300,
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				},
			};

			// 調用函數
			handleWheelZoom(mockCanvas, opt);

			// 檢查 canvas 屬性，而不是函數返回值
			expect(mockCanvas.zoomLevel).toBe(1.1);
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, 1.1);
		});

		test("應正確計算縮小縮放", () => {
			mockCanvas.getZoom.mockReturnValue(2);

			const opt = {
				e: {
					deltaY: 100,
					offsetX: 400,
					offsetY: 300,
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				},
			};

			// 調用函數
			handleWheelZoom(mockCanvas, opt);

			// 檢查 canvas 屬性，而不是函數返回值
			expect(mockCanvas.zoomLevel).toBe(1.9);
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, 1.9);
		});

		test("當已在最小/最大縮放值時不應調用 zoomToPoint", () => {
			// 測試最小值情況
			mockCanvas.getZoom.mockReturnValue(MIN_ZOOM);

			const shrinkOpt = {
				e: {
					deltaY: 100, // 嘗試縮小
					offsetX: 400,
					offsetY: 300,
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				},
			};

			handleWheelZoom(mockCanvas, shrinkOpt);

			// 應該不會調用 zoomToPoint
			expect(mockCanvas.zoomToPoint).not.toHaveBeenCalled();

			// 測試最大值情況
			mockCanvas.zoomToPoint.mockClear();
			mockCanvas.getZoom.mockReturnValue(MAX_ZOOM);

			const enlargeOpt = {
				e: {
					deltaY: -100, // 嘗試放大
					offsetX: 400,
					offsetY: 300,
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				},
			};

			handleWheelZoom(mockCanvas, enlargeOpt);

			// 應該不會調用 zoomToPoint
			expect(mockCanvas.zoomToPoint).not.toHaveBeenCalled();
		});
	});

	// 測試 zoomIn 函數
	describe("zoomIn", () => {
		test("當 canvas 為 null 時應返回原始縮放值", () => {
			const result = zoomIn(null, 1.5);
			expect(result).toBe(1.5);
		});

		test("不應超過最大縮放值", () => {
			// 已經在最大值時不變
			const result1 = zoomIn(mockCanvas, MAX_ZOOM);
			expect(result1).toBe(MAX_ZOOM);

			// 接近最大值時應被限制為最大值
			mockCanvas.zoomToPoint.mockClear();
			const result2 = zoomIn(mockCanvas, MAX_ZOOM - 0.05);
			expect(result2).toBe(MAX_ZOOM);
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, MAX_ZOOM);
		});

		test("應正確增加縮放值", () => {
			const result = zoomIn(mockCanvas, 1);
			expect(result).toBe(1.1);
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, 1.1);
			expect(mockCanvas.zoomLevel).toBe(1.1);
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});

	// 測試 zoomOut 函數
	describe("zoomOut", () => {
		test("當 canvas 為 null 時應返回原始縮放值", () => {
			const result = zoomOut(null, 1.5);
			expect(result).toBe(1.5);
		});

		test("不應低於最小縮放值", () => {
			// 已經在最小值時不變
			const result1 = zoomOut(mockCanvas, MIN_ZOOM);
			expect(result1).toBe(MIN_ZOOM);

			// 接近最小值時應被限制為最小值
			mockCanvas.zoomToPoint.mockClear();
			const result2 = zoomOut(mockCanvas, MIN_ZOOM + 0.05);
			expect(result2).toBe(MIN_ZOOM);
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, MIN_ZOOM);
		});

		test("應正確減少縮放值", () => {
			const result = zoomOut(mockCanvas, 2);
			expect(result).toBe(1.9);
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, 1.9);
			expect(mockCanvas.zoomLevel).toBe(1.9);
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});

	// 測試 setZoomLevel 函數
	describe("setZoomLevel", () => {
		test("當 canvas 為 null 時應返回原始縮放值", () => {
			const result = setZoomLevel(null, 1.5);
			expect(result).toBe(1.5);
		});

		test("應將縮放值限制在最小和最大範圍內", () => {
			expect(setZoomLevel(mockCanvas, 0.05)).toBe(MIN_ZOOM);
			expect(setZoomLevel(mockCanvas, 6)).toBe(MAX_ZOOM);
		});

		test("應舍入到最接近的 0.1 倍數", () => {
			expect(setZoomLevel(mockCanvas, 1.78)).toBe(1.8);
			expect(setZoomLevel(mockCanvas, 2.24)).toBe(2.2);
		});

		test("應正確設置縮放值", () => {
			const result = setZoomLevel(mockCanvas, 1.5);
			expect(result).toBe(1.5);
			expect(mockCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 400, y: 300 }, 1.5);
			expect(mockCanvas.zoomLevel).toBe(1.5);
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});

	// 測試 resetCanvasView 函數
	describe("resetCanvasView", () => {
		test("當 canvas 為 null 時不應拋出錯誤", () => {
			expect(() => resetCanvasView(null)).not.toThrow();
		});

		test("應重置縮放和視角轉換", () => {
			resetCanvasView(mockCanvas);

			expect(mockCanvas.setZoom).toHaveBeenCalledWith(1);
			expect(mockCanvas.zoomLevel).toBe(1);
			expect(mockCanvas.setViewportTransform).toHaveBeenCalledWith([1, 0, 0, 1, 0, 0]);
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});
});
