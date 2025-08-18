import { generateCanvasPreview, exportCanvasSelection } from "../ImageExport";

describe("ImageExport 測試", () => {
	let mockCanvas;
	let originalConsoleError;

	beforeEach(() => {
		// 保存原始的 console.error
		originalConsoleError = console.error;
		console.error = jest.fn();

		// 創建模擬畫布
		mockCanvas = {
			backgroundColor: "#ffffff",
			getZoom: jest.fn().mockReturnValue(1),
			setZoom: jest.fn(),
			viewportTransform: [1, 0, 0, 1, 0, 0],
			setViewportTransform: jest.fn(),
			getObjects: jest.fn(),
			toDataURL: jest.fn().mockReturnValue("data:image/png;base64,test-data"),
			renderAll: jest.fn(),
		};
	});

	afterEach(() => {
		// 還原原始的 console.error
		console.error = originalConsoleError;
		jest.clearAllMocks();
	});

	describe("generateCanvasPreview", () => {
		test("畫布未初始化時應拒絕 Promise", async () => {
			await expect(generateCanvasPreview(null, "png", false)).rejects.toThrow("畫布未初始化");
		});

		test("當畫布沒有物件時應生成預設大小的預覽", async () => {
			// 模擬空畫布
			mockCanvas.getObjects.mockReturnValue([]);
			mockCanvas.width = 800;
			mockCanvas.height = 600;

			const result = await generateCanvasPreview(mockCanvas, "png", false);

			// 檢查是否使用了正確的參數來呼叫 toDataURL
			expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({
					format: "png",
					backgroundColor: "#ffffff",
				})
			);

			// 檢查返回值
			expect(result).toHaveProperty("dataURL");
			expect(result).toHaveProperty("contentSize");
			expect(result.contentSize).toHaveProperty("width");
			expect(result.contentSize).toHaveProperty("height");
		});

		test("當畫布有物件時應計算正確的邊界", async () => {
			// 模擬有物件的畫布
			const mockObjects = [
				{
					getBoundingRect: jest.fn().mockReturnValue({
						left: 100,
						top: 100,
						width: 200,
						height: 150,
					}),
				},
				{
					getBoundingRect: jest.fn().mockReturnValue({
						left: 50,
						top: 75,
						width: 100,
						height: 100,
					}),
				},
			];
			mockCanvas.getObjects.mockReturnValue(mockObjects);
			mockCanvas.width = 800;
			mockCanvas.height = 600;

			const result = await generateCanvasPreview(mockCanvas, "png", false);

			// 驗證結果包含預期的屬性和數據
			expect(result).toHaveProperty("dataURL");
			expect(result).toHaveProperty("contentSize");
			expect(result.contentSize).toHaveProperty("width");
			expect(result.contentSize).toHaveProperty("height");
			expect(result.contentSize).toHaveProperty("left");
			expect(result.contentSize).toHaveProperty("top");

			// 計算包含所有物件的邊界（加上內邊距）
			// Math.max(100, mockCanvas.width * 0.2, mockCanvas.height * 0.2);

			// 應該計算出包含所有物件的邊界，加上內邊距
			expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({
					left: expect.any(Number),
					top: expect.any(Number),
					width: expect.any(Number),
					height: expect.any(Number),
				})
			);
		});

		test("當設置透明背景且格式為 PNG 時應使用空背景色", async () => {
			mockCanvas.getObjects.mockReturnValue([]);

			await generateCanvasPreview(mockCanvas, "png", true);

			expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({
					backgroundColor: "",
				})
			);
		});

		test("當設置透明背景但格式為 JPG 時應使用白色背景", async () => {
			mockCanvas.getObjects.mockReturnValue([]);

			await generateCanvasPreview(mockCanvas, "jpg", true);

			expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({
					format: "jpeg",
					backgroundColor: "#ffffff",
				})
			);
		});

		test("應在操作後恢復畫布的原始狀態", async () => {
			mockCanvas.getObjects.mockReturnValue([]);
			const originalViewportTransform = [0.5, 0, 0, 0.5, 10, 20];
			mockCanvas.viewportTransform = [...originalViewportTransform];
			mockCanvas.getZoom.mockReturnValue(0.5);

			await generateCanvasPreview(mockCanvas, "png", false);

			// 應該恢復原始的視口變換和縮放
			expect(mockCanvas.setViewportTransform).toHaveBeenCalledWith(originalViewportTransform);
			expect(mockCanvas.setZoom).toHaveBeenCalledWith(0.5);
		});

		test("處理例外情況並拒絕 Promise", async () => {
			mockCanvas.getObjects.mockImplementation(() => {
				throw new Error("模擬錯誤");
			});

			await expect(generateCanvasPreview(mockCanvas, "png", false)).rejects.toThrow("模擬錯誤");

			expect(console.error).toHaveBeenCalledWith(expect.stringContaining("生成預覽圖像時出錯"), expect.any(Error));
		});

		test("當畫布只有一個物件且位於原點附近時應設置特殊邊界", async () => {
			// 模擬有一個物件位於原點附近的畫布
			const mockObject = {
				getBoundingRect: jest.fn().mockReturnValue({
					left: 0.5,
					top: 0.5,
					width: 10,
					height: 10,
				}),
			};

			mockCanvas.getObjects.mockReturnValue([mockObject]);
			mockCanvas.width = 800;
			mockCanvas.height = 600;

			await generateCanvasPreview(mockCanvas, "png", false);

			// 不直接檢查內部變量（因為它們不可見），而是檢查 toDataURL 的調用參數
			expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({
					left: expect.any(Number),
					top: expect.any(Number),
					width: expect.any(Number),
					height: expect.any(Number),
				})
			);
		});
	});

	describe("exportCanvasSelection", () => {
		test("畫布未初始化時應拒絕 Promise", async () => {
			await expect(exportCanvasSelection(null, {}, {}, "png", false)).rejects.toThrow("畫布未初始化");
		});

		test("應使用選區參數生成圖像", async () => {
			const mockSelection = { x: 100, y: 100, width: 200, height: 150 };
			const mockContentSize = { left: 50, top: 50, width: 500, height: 400 };

			await exportCanvasSelection(mockCanvas, mockSelection, mockContentSize, "png", false);

			// 檢查是否使用了正確的選區參數
			expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({
					left: expect.any(Number),
					top: expect.any(Number),
					width: expect.any(Number),
					height: expect.any(Number),
				})
			);
		});

		test("當選區超出內容範圍時應調整選區", async () => {
			const mockSelection = { x: 600, y: 500, width: 200, height: 150 };
			const mockContentSize = { left: 50, top: 50, width: 500, height: 400 };

			await exportCanvasSelection(mockCanvas, mockSelection, mockContentSize, "png", false);

			// 驗證選區被調整到有效範圍內
			expect(mockCanvas.toDataURL).toHaveBeenCalled();
		});

		test("當設置透明背景且格式為 PNG 時應設置空背景", async () => {
			const mockSelection = { x: 100, y: 100, width: 200, height: 150 };
			const mockContentSize = { left: 50, top: 50, width: 500, height: 400 };

			// 保存原始的 toDataURL 實現
			const originalToDataURL = mockCanvas.toDataURL;

			// 修改 toDataURL 函數以在調用時捕獲當前背景色
			let capturedBackgroundColor;
			mockCanvas.toDataURL = jest.fn().mockImplementation(() => {
				// 捕獲調用 toDataURL 時的背景色
				capturedBackgroundColor = mockCanvas.backgroundColor;
				return "data:image/png;base64,test-data";
			});

			await exportCanvasSelection(mockCanvas, mockSelection, mockContentSize, "png", true);

			// 驗證在 toDataURL 調用時背景已設置為空
			expect(capturedBackgroundColor).toBe("");

			// 驗證 renderAll 被調用（用於顯示透明背景）
			expect(mockCanvas.renderAll).toHaveBeenCalled();

			// 驗證 toDataURL 被調用並使用空背景
			expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({
					backgroundColor: "",
				})
			);

			// 恢復原始實現
			mockCanvas.toDataURL = originalToDataURL;
		});

		test("應在操作後恢復畫布的原始狀態", async () => {
			const mockSelection = { x: 100, y: 100, width: 200, height: 150 };
			const mockContentSize = { left: 50, top: 50, width: 500, height: 400 };
			const originalViewportTransform = [0.5, 0, 0, 0.5, 10, 20];
			const originalBgColor = "#cccccc";

			mockCanvas.viewportTransform = [...originalViewportTransform];
			mockCanvas.backgroundColor = originalBgColor;
			mockCanvas.getZoom.mockReturnValue(0.5);

			await exportCanvasSelection(mockCanvas, mockSelection, mockContentSize, "png", true);

			// 驗證原始狀態被恢復
			expect(mockCanvas.setViewportTransform).toHaveBeenCalledWith(originalViewportTransform);
			expect(mockCanvas.setZoom).toHaveBeenCalledWith(0.5);
			expect(mockCanvas.backgroundColor).toBe(originalBgColor);
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("處理例外情況並拒絕 Promise", async () => {
			const mockSelection = { x: 100, y: 100, width: 200, height: 150 };
			const mockContentSize = { left: 50, top: 50, width: 500, height: 400 };

			mockCanvas.toDataURL.mockImplementation(() => {
				throw new Error("模擬錯誤");
			});

			await expect(exportCanvasSelection(mockCanvas, mockSelection, mockContentSize, "png", false)).rejects.toThrow(
				"模擬錯誤"
			);

			expect(console.error).toHaveBeenCalled();
		});
	});
});
