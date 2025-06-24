import { handleSaveFile, handleLoadFile, handleFileInputChange } from "../FileOperationHandlers";
import { saveCanvasToFile } from "../CanvasSerialization";
import { loadCanvasFromFile } from "../LoadCanvas";
import { showLoadingMessage, hideLoadingMessage } from "../LoadingMessage";

// 模擬所有依賴的模組
jest.mock("../CanvasSerialization", () => ({
	saveCanvasToFile: jest.fn(),
}));

jest.mock("../LoadCanvas", () => ({
	loadCanvasFromFile: jest.fn(),
}));

jest.mock("../LoadingMessage", () => ({
	showLoadingMessage: jest.fn().mockReturnValue({ id: "loading-message" }),
	hideLoadingMessage: jest.fn(),
}));

describe("FileOperationHandlers 測試", () => {
	// 儲存原始的全局函數以便在測試後恢復
	const originalAlert = window.alert;
	const originalPrompt = window.prompt;
	const originalConsoleError = console.error;

	// 儲存模擬的 loading message
	let mockLoadingMessage;

	beforeEach(() => {
		// 重置所有模擬對象
		jest.clearAllMocks();

		// 模擬全局函數
		window.alert = jest.fn();
		window.prompt = jest.fn().mockReturnValue("test.feelink");
		console.error = jest.fn();

		// 設置模擬 loading message
		mockLoadingMessage = { id: "loading-message" };
		showLoadingMessage.mockReturnValue(mockLoadingMessage);
	});

	afterEach(() => {
		// 恢復原始的全局函數
		window.alert = originalAlert;
		window.prompt = originalPrompt;
		console.error = originalConsoleError;
	});

	describe("handleSaveFile", () => {
		test("當 canvas 未初始化時應該顯示錯誤訊息", () => {
			// 測試使用 null canvas
			handleSaveFile(null);

			// 應該記錄錯誤
			expect(console.error).toHaveBeenCalledWith("畫布未初始化");
			// 不應調用保存函數
			expect(saveCanvasToFile).not.toHaveBeenCalled();
		});

		test("當使用者取消檔案命名時應該提前返回", () => {
			// 模擬使用者取消輸入（prompt 返回 null）
			window.prompt.mockReturnValueOnce(null);

			handleSaveFile({ id: "mock-canvas" });

			// 不應調用保存函數
			expect(saveCanvasToFile).not.toHaveBeenCalled();
		});

		test("檔案保存成功時應顯示成功訊息", () => {
			// 模擬保存成功
			saveCanvasToFile.mockReturnValueOnce(true);

			const mockCanvas = { id: "mock-canvas" };
			handleSaveFile(mockCanvas);

			// 應使用使用者提供的檔名調用保存函數
			expect(saveCanvasToFile).toHaveBeenCalledWith(mockCanvas, "test.feelink");
			// 應顯示成功訊息
			expect(window.alert).toHaveBeenCalledWith("檔案保存成功！");
		});

		test("檔案保存失敗時應顯示失敗訊息", () => {
			// 模擬保存失敗
			saveCanvasToFile.mockReturnValueOnce(false);

			const mockCanvas = { id: "mock-canvas" };
			handleSaveFile(mockCanvas);

			// 應顯示失敗訊息
			expect(window.alert).toHaveBeenCalledWith("檔案保存失敗，請重試。");
		});
	});

	describe("handleLoadFile", () => {
		test("當 canvas 未準備好時應顯示提示訊息", () => {
			const mockFileInputRef = { current: { click: jest.fn() } };

			handleLoadFile(mockFileInputRef, false);

			// 應顯示警告訊息
			expect(window.alert).toHaveBeenCalledWith("畫布尚未準備好，請稍後再試");
			// 不應觸發文件選擇器點擊
			expect(mockFileInputRef.current.click).not.toHaveBeenCalled();
		});

		test("應觸發文件選擇器點擊", () => {
			const mockFileInputRef = { current: { click: jest.fn() } };

			handleLoadFile(mockFileInputRef, true);

			// 應觸發文件選擇器點擊
			expect(mockFileInputRef.current.click).toHaveBeenCalled();
		});
	});

	describe("handleFileInputChange", () => {
		test("當未選擇文件時應提前返回", () => {
			const mockEvent = { target: { files: [] } };
			const mockCanvas = { id: "mock-canvas" };

			handleFileInputChange(mockEvent, mockCanvas, true);

			// 不應顯示加載訊息
			expect(showLoadingMessage).not.toHaveBeenCalled();
			// 不應調用加載函數
			expect(loadCanvasFromFile).not.toHaveBeenCalled();
		});

		test("應顯示加載訊息並調用 loadCanvasFromFile", () => {
			const mockFile = { name: "test.feelink" };
			const mockEvent = {
				target: {
					files: [mockFile],
					value: "test-path",
				},
			};
			const mockCanvas = { id: "mock-canvas" };

			handleFileInputChange(mockEvent, mockCanvas, true);

			// 應顯示加載訊息
			expect(showLoadingMessage).toHaveBeenCalled();
			// 應調用加載函數
			expect(loadCanvasFromFile).toHaveBeenCalledWith(mockCanvas, mockFile, expect.any(Function));
		});

		test("加載成功時應顯示成功訊息並清理歷史", () => {
			const mockFile = { name: "test.feelink" };
			const mockEvent = {
				target: {
					files: [mockFile],
					value: "test-path",
				},
			};
			const mockCanvas = {
				id: "mock-canvas",
				historyManager: {
					clear: jest.fn(),
					saveState: jest.fn(),
				},
			};

			// 調用 handleFileInputChange
			handleFileInputChange(mockEvent, mockCanvas, true);

			// 獲取 loadCanvasFromFile 調用時的回調函數
			const callback = loadCanvasFromFile.mock.calls[0][2];

			// 模擬成功加載
			callback(true);

			// 應清理歷史堆疊
			expect(mockCanvas.historyManager.clear).toHaveBeenCalled();
			// 應保存當前狀態
			expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();
			// 應顯示成功訊息
			expect(window.alert).toHaveBeenCalledWith("檔案載入成功！");
			// 應移除加載訊息
			expect(hideLoadingMessage).toHaveBeenCalledWith(mockLoadingMessage);
		});

		test("加載失敗時應顯示錯誤訊息", () => {
			const mockFile = { name: "test.feelink" };
			const mockEvent = {
				target: {
					files: [mockFile],
					value: "test-path",
				},
			};
			const mockCanvas = { id: "mock-canvas" };
			const mockError = new Error("格式錯誤");

			// 調用 handleFileInputChange
			handleFileInputChange(mockEvent, mockCanvas, true);

			// 獲取 loadCanvasFromFile 調用時的回調函數
			const callback = loadCanvasFromFile.mock.calls[0][2];

			// 模擬加載失敗
			callback(false, mockError);

			// 應顯示錯誤訊息
			expect(window.alert).toHaveBeenCalledWith("檔案載入失敗：格式錯誤");
			// 應移除加載訊息
			expect(hideLoadingMessage).toHaveBeenCalledWith(mockLoadingMessage);
		});

		test("當 historyManager 不存在時不應拋出錯誤", () => {
			const mockFile = { name: "test.feelink" };
			const mockEvent = {
				target: {
					files: [mockFile],
					value: "test-path",
				},
			};
			// canvas 沒有 historyManager
			const mockCanvas = { id: "mock-canvas" };

			// 調用 handleFileInputChange
			handleFileInputChange(mockEvent, mockCanvas, true);

			// 獲取 loadCanvasFromFile 調用時的回調函數
			const callback = loadCanvasFromFile.mock.calls[0][2];

			// 模擬成功加載 - 不應拋出錯誤
			expect(() => callback(true)).not.toThrow();
		});

		test("應在結束時清空文件輸入值", () => {
			const mockFile = { name: "test.feelink" };
			const mockEvent = {
				target: {
					files: [mockFile],
					value: "test-path",
				},
			};
			const mockCanvas = { id: "mock-canvas" };

			handleFileInputChange(mockEvent, mockCanvas, true);

			// 應清空文件輸入值
			expect(mockEvent.target.value).toBe("");
		});
	});
});
