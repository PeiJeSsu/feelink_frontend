import * as fabric from "fabric";
import { initializeCanvas, clearCanvas, resizeCanvas, setDrawingMode } from "../CanvasOperations";

// 模擬 fabric.js Canvas 構造函數
jest.mock("fabric", () => {
	// 創建模擬 Canvas 實例的函數
	const createMockCanvas = () => {
		return {
			renderAll: jest.fn(),
			clear: jest.fn(),
			setDimensions: jest.fn(),
			isDrawingMode: false,
			backgroundColor: null,
		};
	};

	const mockFabric = {
		Canvas: jest.fn().mockImplementation(() => {
			const mockCanvasInstance = createMockCanvas();
			// 確保返回的實例有所有必要的方法
			return mockCanvasInstance;
		}),
		FabricObject: {
			prototype: {
				transparentCorners: true,
			},
		},
	};
	return mockFabric;
});

describe("CanvasOperations", () => {
	let originalInnerWidth;
	let originalInnerHeight;
	let canvasRefMock;
	let mockCanvasInstance;

	beforeEach(() => {
		// 保存原始視窗尺寸
		originalInnerWidth = window.innerWidth;
		originalInnerHeight = window.innerHeight;

		// 模擬視窗尺寸
		Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
		Object.defineProperty(window, "innerHeight", { value: 768, writable: true });

		// 創建模擬 Canvas 實例
		mockCanvasInstance = {
			renderAll: jest.fn(),
			clear: jest.fn(),
			setDimensions: jest.fn(),
			isDrawingMode: false,
			backgroundColor: null,
		};

		// 配置 fabric.Canvas 模擬返回我們的實例
		fabric.Canvas.mockImplementation(() => mockCanvasInstance);

		// 模擬 canvas 參考
		canvasRefMock = "canvas-reference";
	});

	afterEach(() => {
		// 恢復原始視窗尺寸
		Object.defineProperty(window, "innerWidth", { value: originalInnerWidth });
		Object.defineProperty(window, "innerHeight", { value: originalInnerHeight });
	});

	// 測試 initializeCanvas 方法
	describe("initializeCanvas", () => {
		beforeEach(() => {
			// 每次測試前重置 mock
			fabric.Canvas.mockClear();
		});

		test("應使用提供的寬度和高度初始化畫布", () => {
			const canvas = initializeCanvas(canvasRefMock, 800, 600);

			expect(fabric.Canvas).toHaveBeenCalledWith(
				canvasRefMock,
				expect.objectContaining({
					width: 800,
					height: 600,
					backgroundColor: "#ffffff",
				})
			);
			expect(canvas.renderAll).toHaveBeenCalled();
		});

		test("當未提供尺寸時應使用默認值", () => {
			initializeCanvas(canvasRefMock);

			// 預設寬度為 window.innerWidth - 60
			expect(fabric.Canvas).toHaveBeenCalledWith(
				canvasRefMock,
				expect.objectContaining({
					width: window.innerWidth - 60,
					height: window.innerHeight,
				})
			);
		});

		test("應正確設置初始屬性", () => {
			const canvas = initializeCanvas(canvasRefMock);

			// 檢查是否設置了透明角落
			expect(fabric.FabricObject.prototype.transparentCorners).toBe(false);

			// 檢查是否初始化了縮放級別
			expect(canvas.zoomLevel).toBe(1);

			// 檢查其他重要屬性是否設置
			expect(fabric.Canvas).toHaveBeenCalledWith(
				canvasRefMock,
				expect.objectContaining({
					backgroundColor: "#ffffff",
					isDrawingMode: false,
					renderOnAddRemove: true,
					stateful: true,
				})
			);
		});

		test("應返回初始化的 Canvas 物件", () => {
			const canvas = initializeCanvas(canvasRefMock);
			expect(canvas).toBeDefined();
			expect(canvas.renderAll).toBeDefined();
		});
	});

	// 測試 clearCanvas 方法
	describe("clearCanvas", () => {
		test("應清空畫布並設置白色背景", () => {
			const mockCanvas = {
				clear: jest.fn(),
				renderAll: jest.fn(),
				backgroundColor: "#000000",
			};

			clearCanvas(mockCanvas);

			expect(mockCanvas.clear).toHaveBeenCalled();
			expect(mockCanvas.backgroundColor).toBe("#ffffff");
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("當 canvas 為 null 時不應拋出錯誤", () => {
			expect(() => clearCanvas(null)).not.toThrow();
		});
	});

	// 測試 resizeCanvas 方法
	describe("resizeCanvas", () => {
		test("應使用指定尺寸調整畫布大小", () => {
			const mockCanvas = {
				setDimensions: jest.fn(),
			};

			resizeCanvas(mockCanvas, 800, 600);

			expect(mockCanvas.setDimensions).toHaveBeenCalledWith({
				width: 800,
				height: 600,
			});
		});

		test("當 canvas 為 null 時不應拋出錯誤", () => {
			expect(() => resizeCanvas(null, 800, 600)).not.toThrow();
		});
	});

	// 測試 setDrawingMode 方法
	describe("setDrawingMode", () => {
		test("應設置畫布的繪圖模式", () => {
			const mockCanvas = {
				isDrawingMode: false,
			};

			setDrawingMode(mockCanvas, true);
			expect(mockCanvas.isDrawingMode).toBe(true);

			setDrawingMode(mockCanvas, false);
			expect(mockCanvas.isDrawingMode).toBe(false);
		});

		test("當 canvas 為 null 時不應拋出錯誤", () => {
			expect(() => setDrawingMode(null, true)).not.toThrow();
		});
	});
});
