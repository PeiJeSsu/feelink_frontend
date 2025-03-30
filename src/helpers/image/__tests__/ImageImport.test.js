import * as fabric from "fabric";
import { importImage } from "../ImageImport";

// 完全模擬 fabric 模組
jest.mock("fabric", () => ({
	FabricImage: jest.fn(),
}));

describe("ImageImport 測試", () => {
	let mockCanvas;
	let mockCallback;
	let mockFile;
	let mockFileReader;
	let mockImage;
	let mockFabricImage;
	let originalFileReader;
	let originalImage;

	beforeEach(() => {
		// 備份原始對象
		originalFileReader = global.FileReader;
		originalImage = global.Image;

		// 清除所有模擬
		jest.clearAllMocks();

		// 創建模擬的 FabricImage 實例
		mockFabricImage = {
			width: 200,
			height: 150,
			scale: jest.fn(),
			set: jest.fn(),
		};

		// 設置 FabricImage 構造函數返回我們的模擬實例
		fabric.FabricImage.mockReturnValue(mockFabricImage);

		// 創建模擬畫布
		mockCanvas = {
			width: 800,
			height: 600,
			add: jest.fn(),
			renderAll: jest.fn(),
			historyManager: {
				saveState: jest.fn(),
			},
		};

		// 創建模擬回調函數
		mockCallback = jest.fn();

		// 創建模擬檔案
		mockFile = new Blob(["test-image-data"], { type: "image/jpeg" });

		// 創建模擬 Image 對象
		mockImage = {
			src: "",
			onload: null,
		};

		// 模擬 Image 構造函數
		global.Image = jest.fn(() => mockImage);

		// 創建模擬 FileReader
		mockFileReader = {
			readAsDataURL: jest.fn(),
			onload: null,
		};

		// 模擬 FileReader 構造函數
		global.FileReader = jest.fn(() => mockFileReader);
	});

	afterEach(() => {
		// 恢復原始對象
		global.FileReader = originalFileReader;
		global.Image = originalImage;
		jest.restoreAllMocks();
	});

	test("應正確處理整個圖片導入流程", () => {
		// 調用被測試的函數
		importImage(mockFile, mockCanvas, mockCallback);

		// 驗證 FileReader 被創建
		expect(global.FileReader).toHaveBeenCalled();
		expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);

		// 模擬 FileReader.onload 被調用
		const fileResult = "data:image/jpeg;base64,test-data";
		mockFileReader.onload({ target: { result: fileResult } });

		// 驗證 Image 對象被創建並設置了 src
		expect(global.Image).toHaveBeenCalled();
		expect(mockImage.src).toBe(fileResult);

		// 在觸發 Image.onload 前設置 mockFabricImage 的尺寸
		mockFabricImage.width = 200;
		mockFabricImage.height = 150;

		// 模擬 Image.onload 被調用
		mockImage.onload();

		// 驗證 fabric.FabricImage 被創建
		expect(fabric.FabricImage).toHaveBeenCalledWith(mockImage);

		// 計算期望的縮放比例
		const expectedScale = Math.min(
			(mockCanvas.width * 0.8) / mockFabricImage.width,
			(mockCanvas.height * 0.8) / mockFabricImage.height
		);

		// 驗證縮放方法被調用
		expect(mockFabricImage.scale).toHaveBeenCalledWith(expectedScale);

		// 驗證位置設置
		expect(mockFabricImage.set).toHaveBeenCalledWith({
			left: (mockCanvas.width - mockFabricImage.width * expectedScale) / 2,
			top: (mockCanvas.height - mockFabricImage.height * expectedScale) / 2,
		});

		// 驗證圖片被添加到畫布
		expect(mockCanvas.add).toHaveBeenCalledWith(mockFabricImage);

		// 驗證畫布被重新渲染
		expect(mockCanvas.renderAll).toHaveBeenCalled();

		// 驗證歷史記錄被保存
		expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();

		// 驗證回調被調用
		expect(mockCallback).toHaveBeenCalled();
	});

	test("當沒有提供回調時應正常工作", () => {
		// 調用函數時不提供回調
		importImage(mockFile, mockCanvas);

		// 模擬文件讀取完成
		mockFileReader.onload({ target: { result: "data:image/jpeg;base64,test-data" } });

		// 模擬圖片載入完成
		mockImage.onload();

		// 驗證畫布上的操作正常進行
		expect(mockCanvas.add).toHaveBeenCalled();
		expect(mockCanvas.renderAll).toHaveBeenCalled();
		expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();
	});

	test("當畫布沒有 historyManager 時應正常工作", () => {
		// 創建沒有 historyManager 的畫布
		const canvasWithoutHistory = {
			width: 800,
			height: 600,
			add: jest.fn(),
			renderAll: jest.fn(),
		};

		// 調用函數
		importImage(mockFile, canvasWithoutHistory, mockCallback);

		// 模擬文件讀取完成
		mockFileReader.onload({ target: { result: "data:image/jpeg;base64,test-data" } });

		// 模擬圖片載入完成
		mockImage.onload();

		// 驗證畫布上的操作正常進行
		expect(canvasWithoutHistory.add).toHaveBeenCalled();
		expect(canvasWithoutHistory.renderAll).toHaveBeenCalled();

		// 驗證回調被調用
		expect(mockCallback).toHaveBeenCalled();
	});

	test("應正確計算不同尺寸的圖片和畫布", () => {
		// 設置不同尺寸
		mockCanvas.width = 1000;
		mockCanvas.height = 800;
		mockFabricImage.width = 400;
		mockFabricImage.height = 300;

		// 調用函數
		importImage(mockFile, mockCanvas, mockCallback);

		// 模擬文件讀取和圖片載入
		mockFileReader.onload({ target: { result: "data:image/jpeg;base64,test-data" } });
		mockImage.onload();

		// 計算期望的縮放和位置
		const expectedScale = Math.min(
			(mockCanvas.width * 0.8) / mockFabricImage.width,
			(mockCanvas.height * 0.8) / mockFabricImage.height
		);

		// 驗證縮放和位置設置
		expect(mockFabricImage.scale).toHaveBeenCalledWith(expectedScale);
		expect(mockFabricImage.set).toHaveBeenCalledWith({
			left: (mockCanvas.width - mockFabricImage.width * expectedScale) / 2,
			top: (mockCanvas.height - mockFabricImage.height * expectedScale) / 2,
		});
	});
});
