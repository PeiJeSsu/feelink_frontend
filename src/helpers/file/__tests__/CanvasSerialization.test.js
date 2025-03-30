import { serializeCanvas, saveCanvasToFile } from "../CanvasSerialization";

describe("CanvasSerialization 測試", () => {
	// 儲存原始的瀏覽器 API
	let originalCreateElement;
	let originalCreateObjectURL;
	let originalRevokeObjectURL;
	let originalAppendChild;
	let originalRemoveChild;
	let originalConsoleError;

	// 增加這個模擬連結物件
	let mockLink;

	beforeAll(() => {
		// 保存原始的瀏覽器 API
		originalCreateElement = document.createElement;
		originalCreateObjectURL = URL.createObjectURL;
		originalRevokeObjectURL = URL.revokeObjectURL;
		originalAppendChild = document.body.appendChild;
		originalRemoveChild = document.body.removeChild;
		originalConsoleError = console.error;
	});

	afterAll(() => {
		// 恢復原始的瀏覽器 API
		document.createElement = originalCreateElement;
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
		document.body.appendChild = originalAppendChild;
		document.body.removeChild = originalRemoveChild;
		console.error = originalConsoleError;
	});

	beforeEach(() => {
		// 重置所有模擬對象
		jest.clearAllMocks();

		// 創建模擬連結
		mockLink = {
			href: "",
			download: "",
			click: jest.fn(),
		};

		// 修改 createElement 模擬，始終返回同一個物件
		document.createElement = jest.fn().mockImplementation((tag) => {
			if (tag === "a") return mockLink;
			return {};
		});

		// 模擬 URL.createObjectURL
		URL.createObjectURL = jest.fn().mockReturnValue("mock-blob-url");

		// 模擬 URL.revokeObjectURL
		URL.revokeObjectURL = jest.fn();

		// 模擬 document.body.appendChild 和 removeChild
		document.body.appendChild = jest.fn();
		document.body.removeChild = jest.fn();

		// 模擬 console.error
		console.error = jest.fn();
	});

	describe("serializeCanvas", () => {
		test("當傳入 null 或 undefined 時應返回 null", () => {
			expect(serializeCanvas(null)).toBeNull();
			expect(serializeCanvas(undefined)).toBeNull();
		});

		test("應使用正確的選項調用 canvas.toJSON", () => {
			// 創建模擬 canvas 對象
			const mockCanvas = {
				toJSON: jest.fn().mockReturnValue({ objects: [] }),
			};

			serializeCanvas(mockCanvas);

			// 驗證使用正確的參數調用了 toJSON
			expect(mockCanvas.toJSON).toHaveBeenCalledWith(["id", "selectable", "evented", "_originalSelectable"]);
		});

		test("應返回序列化後的 JSON 字符串", () => {
			const canvasData = { objects: [{ type: "rect", id: "rect1" }] };
			const mockCanvas = {
				toJSON: jest.fn().mockReturnValue(canvasData),
			};

			const result = serializeCanvas(mockCanvas);

			// 驗證結果是有效的 JSON 字符串且包含預期數據
			expect(result).toBe(JSON.stringify(canvasData));
			expect(JSON.parse(result)).toEqual(canvasData);
		});
	});

	describe("saveCanvasToFile", () => {
		test("當傳入 null 或 undefined 時應返回 false", () => {
			expect(saveCanvasToFile(null)).toBe(false);
			expect(saveCanvasToFile(undefined)).toBe(false);
		});

		test("如果未提供文件名，應使用默認文件名", () => {
			const mockCanvas = {
				toJSON: jest.fn().mockReturnValue({ objects: [] }),
			};

			const result = saveCanvasToFile(mockCanvas);

			// 檢查模擬連結物件的下載屬性
			expect(mockLink.download).toBe("drawing.feelink");
			expect(result).toBe(true);
		});

		test("應自動添加 .feelink 擴展名", () => {
			const mockCanvas = {
				toJSON: jest.fn().mockReturnValue({ objects: [] }),
			};

			saveCanvasToFile(mockCanvas, "myDrawing");

			// 驗證文件名添加了擴展名
			expect(mockLink.download).toBe("myDrawing.feelink");
		});

		test("如果文件名已有 .feelink 擴展名，不應重複添加", () => {
			const mockCanvas = {
				toJSON: jest.fn().mockReturnValue({ objects: [] }),
			};

			saveCanvasToFile(mockCanvas, "myDrawing.feelink");

			// 驗證沒有重複添加擴展名
			expect(mockLink.download).toBe("myDrawing.feelink");
		});

		test("應創建 Blob、生成 URL 並觸發下載", () => {
			const mockCanvas = {
				toJSON: jest.fn().mockReturnValue({ objects: [] }),
			};

			const result = saveCanvasToFile(mockCanvas, "test.feelink");

			// 檢查是否創建了 URL
			expect(URL.createObjectURL).toHaveBeenCalled();

			// 檢查是否設置了 href（使用模擬連結物件）
			expect(mockLink.href).toBe("mock-blob-url");

			// 檢查是否模擬了點擊
			expect(mockLink.click).toHaveBeenCalled();

			// 檢查是否添加和移除了元素
			expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
			expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);

			// 檢查是否釋放了 URL
			expect(URL.revokeObjectURL).toHaveBeenCalledWith("mock-blob-url");

			// 應該返回 true 表示成功
			expect(result).toBe(true);
		});

		test("當發生異常時應捕獲並返回 false", () => {
			const mockCanvas = {
				toJSON: jest.fn().mockReturnValue({ objects: [] }),
			};

			// 模擬 URL.createObjectURL 拋出錯誤
			URL.createObjectURL = jest.fn().mockImplementation(() => {
				throw new Error("模擬錯誤");
			});

			const result = saveCanvasToFile(mockCanvas);

			// 應該記錄錯誤
			expect(console.error).toHaveBeenCalled();

			// 應該返回 false 表示失敗
			expect(result).toBe(false);
		});
	});
});
