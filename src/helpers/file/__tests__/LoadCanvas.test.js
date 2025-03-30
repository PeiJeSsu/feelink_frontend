import { loadCanvasFromJSON, loadCanvasFromFile } from "../LoadCanvas";

// 模擬 FileReader
const mockFileReader = {
	readAsText: jest.fn(),
	onload: null,
	onerror: null,
};

// 備份原始的 FileReader 和 setTimeout
const originalFileReader = global.FileReader;
const originalSetTimeout = global.setTimeout;

describe("LoadCanvas 測試", () => {
	// 模擬 canvas 和相關函數
	let mockCanvas;
	let mockSetTimeout;

	beforeEach(() => {
		jest.clearAllMocks();

		// 模擬 console.error 和 console.log
		console.error = jest.fn();
		console.log = jest.fn();

		// 創建模擬 canvas
		mockCanvas = {
			clear: jest.fn(),
			loadFromJSON: jest.fn(),
			setViewportTransform: jest.fn(),
			getObjects: jest.fn().mockReturnValue([{ type: "rect" }, { type: "circle" }]),
			selection: false,
			requestRenderAll: jest.fn(),
			zoomLevel: undefined,
		};

		// 模擬 FileReader
		global.FileReader = jest.fn(() => mockFileReader);

		// 模擬 setTimeout
		mockSetTimeout = jest.fn().mockImplementation((callback, delay) => {
			return originalSetTimeout(callback, 0); // 立即執行，但仍然是異步的
		});
		global.setTimeout = mockSetTimeout;
	});

	afterEach(() => {
		// 還原原始 API
		global.FileReader = originalFileReader;
		global.setTimeout = originalSetTimeout;
	});

	describe("loadCanvasFromJSON", () => {
		test("當 canvas 為 null 時應返回 false", () => {
			const result = loadCanvasFromJSON(null, '{"objects":[]}');
			expect(result).toBe(false);
		});

		test("當 JSON 為 null 或空時應返回 false", () => {
			expect(loadCanvasFromJSON(mockCanvas, null)).toBe(false);
			expect(loadCanvasFromJSON(mockCanvas, "")).toBe(false);
		});

		test("當 JSON 解析出錯時應返回 false 並記錄錯誤", () => {
			const result = loadCanvasFromJSON(mockCanvas, "invalid json");
			expect(result).toBe(false);
			expect(console.error).toHaveBeenCalledWith("加載畫布失敗:", expect.any(Error));
		});

		test("成功加載有 zoomLevel 的 JSON 時應設置畫布屬性", () => {
			const jsonWithZoom = JSON.stringify({
				objects: [],
				zoomLevel: 1.5,
				viewportTransform: [1.5, 0, 0, 1.5, 100, 100],
			});

			const result = loadCanvasFromJSON(mockCanvas, jsonWithZoom);

			// 取得 loadFromJSON 的回調函數並執行
			const callback = mockCanvas.loadFromJSON.mock.calls[0][1];
			callback();

			expect(result).toBe(true);
			expect(mockCanvas.clear).toHaveBeenCalled();
			expect(mockCanvas.loadFromJSON).toHaveBeenCalledWith(jsonWithZoom, expect.any(Function));
			expect(mockCanvas.zoomLevel).toBe(1.5);
			expect(mockCanvas.setViewportTransform).toHaveBeenCalledWith([1.5, 0, 0, 1.5, 100, 100]);
			expect(mockCanvas.getObjects).toHaveBeenCalled();
			expect(mockCanvas.selection).toBe(true);
			expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
		});

		test("成功加載無 zoomLevel 的 JSON 時應設置默認值", () => {
			const simpleJson = JSON.stringify({
				objects: [],
			});

			const result = loadCanvasFromJSON(mockCanvas, simpleJson);

			// 取得 loadFromJSON 的回調函數並執行
			const callback = mockCanvas.loadFromJSON.mock.calls[0][1];
			callback();

			expect(result).toBe(true);
			expect(mockCanvas.zoomLevel).toBe(1);
			expect(mockCanvas.setViewportTransform).toHaveBeenCalledWith([1, 0, 0, 1, 0, 0]);
		});

		test("應設置所有物件為可選和可接收事件", () => {
			const simpleJson = JSON.stringify({
				objects: [{ type: "rect" }, { type: "circle" }],
			});

			loadCanvasFromJSON(mockCanvas, simpleJson);

			// 取得 loadFromJSON 的回調函數並執行
			const callback = mockCanvas.loadFromJSON.mock.calls[0][1];
			callback();

			// 檢查每個物件是否被正確設置
			const objects = mockCanvas.getObjects();
			expect(objects[0].selectable).toBe(true);
			expect(objects[0].evented).toBe(true);
			expect(objects[1].selectable).toBe(true);
			expect(objects[1].evented).toBe(true);
		});
	});

	describe("loadCanvasFromFile", () => {
		test("當檔案為 null 時應調用 callback 並返回錯誤", () => {
			const callback = jest.fn();
			loadCanvasFromFile(mockCanvas, null, callback);

			expect(callback).toHaveBeenCalledWith(false, expect.any(Error));
			expect(callback.mock.calls[0][1].message).toBe("未選擇文件");
		});

		test("當畫布為 null 時應使用 setTimeout 延遲重試", () => {
			const mockFile = new Blob(['{"objects":[]}'], { type: "application/json" });
			const callback = jest.fn();

			loadCanvasFromFile(null, mockFile, callback);

			// 使用我們的 mock setTimeout
			expect(mockSetTimeout).toHaveBeenCalled();
			expect(mockSetTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
		});

		test("成功讀取文件時應調用 loadCanvasFromJSON 並執行回調", () => {
			const mockFile = new Blob(['{"objects":[]}'], { type: "application/json" });
			const callback = jest.fn();

			loadCanvasFromFile(mockCanvas, mockFile, callback);

			// 模擬文件讀取成功
			mockFileReader.onload({ target: { result: '{"objects":[]}' } });

			expect(callback).toHaveBeenCalledWith(true);
			expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
		});

		test("文件讀取失敗時應調用錯誤回調", () => {
			const mockFile = new Blob(['{"objects":[]}'], { type: "application/json" });
			const callback = jest.fn();
			const mockError = new Error("讀取失敗");

			loadCanvasFromFile(mockCanvas, mockFile, callback);

			// 模擬讀取錯誤
			mockFileReader.onerror(mockError);

			expect(console.error).toHaveBeenCalledWith("讀取文件失敗:", mockError);
			expect(callback).toHaveBeenCalledWith(false, mockError);
		});

		test("loadCanvasFromJSON 拋出錯誤時應捕獲並調用錯誤回調", () => {
			const mockFile = new Blob(['{"objects":[]}'], { type: "application/json" });
			const callback = jest.fn();

			loadCanvasFromFile(mockCanvas, mockFile, callback);

			// 模擬 onload 中拋出錯誤
			// 不直接替換 onload，而是觸發錯誤情況
			mockFileReader.onload({
				target: {
					result: "invalid-json-that-will-fail",
				},
			});

			// 檢查是否捕獲了錯誤並記錄
			expect(console.error).toHaveBeenCalled();
			// 確認回調被調用且第一個參數為 false
			expect(callback).toHaveBeenCalled();
			expect(callback.mock.calls[0][0]).toBe(false);
		});
	});
});
