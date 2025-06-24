import * as fabric from "fabric";
import { initializeCanvas, clearCanvas, resizeCanvas, setDrawingMode } from "../CanvasOperations";

// 模擬 fabric.js Canvas 構造函數
jest.mock("fabric", () => {
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
			return mockCanvasInstance;
		}),
		FabricObject: {
			prototype: {
				transparentCorners: true,
			},
		},
		FabricImage: function (imgObj) {
			this.width = imgObj.width || 100;
			this.height = imgObj.height || 100;
			this.set = jest.fn();
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

	function verifyImageAddedCommon(mockCanvas, mockFabricImage, hasHistory, done) {
		expect(mockCanvas.add).toHaveBeenCalledWith(mockFabricImage);
		expect(mockCanvas.setActiveObject).toHaveBeenCalledWith(mockFabricImage);
		expect(mockCanvas.renderAll).toHaveBeenCalled();
		if (hasHistory) {
			expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();
		}
		done();
	}

	function MockImageWithSize(width, height, onloadHandlerRef) {
		this.width = width;
		this.height = height;
		setTimeout(() => {
			if (onloadHandlerRef.current) onloadHandlerRef.current();
		}, 0);
	}
	Object.defineProperty(MockImageWithSize.prototype, "onload", {
		set(fn) {
			this._onloadHandlerRef.current = fn;
		},
	});

	describe("addImageToCanvas", () => {
		let originalImage;
		let originalFabricImage;
		beforeAll(() => {
			originalImage = global.Image;
			originalFabricImage = global.fabric ? global.fabric.FabricImage : undefined;
			global.fabric = global.fabric || {};
		});
		afterAll(() => {
			global.Image = originalImage;
			if (originalFabricImage !== undefined) {
				global.fabric.FabricImage = originalFabricImage;
			}
		});
		test("canvas 為 null 時不應報錯", () => {
			expect(() => {
				require("../CanvasOperations").addImageToCanvas(null, "data:image/png;base64,xxx");
			}).not.toThrow();
		});
		test("imageData 為 null 時不應報錯", () => {
			const mockCanvas = {};
			expect(() => {
				require("../CanvasOperations").addImageToCanvas(mockCanvas, null);
			}).not.toThrow();
		});
		test("Image onload 正常流程，應正確加入圖片並設屬性與呼叫 renderAll/saveState", (done) => {
			const mockCanvas = {
				add: jest.fn(),
				setActiveObject: jest.fn(),
				renderAll: jest.fn(),
				historyManager: { saveState: jest.fn() },
			};
			Object.defineProperty(window, "innerWidth", { value: 800, writable: true });
			Object.defineProperty(window, "innerHeight", { value: 600, writable: true });
			const onloadHandlerRef = { current: null };
			global.Image = function () {
				return new MockImageWithSize(100, 50, onloadHandlerRef);
			};
			const imageData = "data:image/png;base64,xxx";
			require("../CanvasOperations").addImageToCanvas(mockCanvas, imageData);
			setTimeout(() => {
				expect(mockCanvas.add).toHaveBeenCalled();
				const addedImage = mockCanvas.add.mock.calls[0][0];
				expect(addedImage.set).toHaveBeenCalledWith({
					scaleX: 12,
					scaleY: 12,
					left: -200,
					top: 0,
				});
				verifyImageAddedCommon(mockCanvas, addedImage, true, done);
			}, 10);
		});
		test("Image onload 時無 historyManager 也不報錯", (done) => {
			const mockCanvas = {
				add: jest.fn(),
				setActiveObject: jest.fn(),
				renderAll: jest.fn(),
			};
			Object.defineProperty(window, "innerWidth", { value: 400, writable: true });
			Object.defineProperty(window, "innerHeight", { value: 300, writable: true });
			const onloadHandlerRef = { current: null };
			global.Image = function () {
				return new MockImageWithSize(100, 100, onloadHandlerRef);
			};
			const imageData = "data:image/png;base64,yyy";
			require("../CanvasOperations").addImageToCanvas(mockCanvas, imageData);
			setTimeout(() => {
				expect(mockCanvas.add).toHaveBeenCalled();
				const addedImage = mockCanvas.add.mock.calls[0][0];
				verifyImageAddedCommon(mockCanvas, addedImage, false, done);
			}, 10);
		});
	});

	describe("clearCanvas 無 historyManager 分支", () => {
		test("clearCanvas: 沒有 historyManager 也不報錯", () => {
			const mockCanvas = {
				clear: jest.fn(),
				renderAll: jest.fn(),
				backgroundColor: "#000000",
			};
			require("../CanvasOperations").clearCanvas(mockCanvas);
			expect(mockCanvas.clear).toHaveBeenCalled();
			expect(mockCanvas.backgroundColor).toBe("#ffffff");
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});
});
