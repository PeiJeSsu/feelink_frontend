import { renderHook } from "@testing-library/react";
import { useCanvasInitialization } from "../useCanvasInitialization";
import { initializeCanvas, resizeCanvas, clearCanvas } from "../../helpers/canvas/CanvasOperations";
import { setupPinchZoom } from "../../helpers/canvas/ZoomHelper";
import createHistoryManager from "../../helpers/history/HistoryManager";

// 模擬依賴的模組
jest.mock("../../helpers/canvas/CanvasOperations", () => ({
	initializeCanvas: jest.fn(),
	resizeCanvas: jest.fn(),
	clearCanvas: jest.fn(),
}));

jest.mock("../../helpers/canvas/ZoomHelper", () => ({
	setupPinchZoom: jest.fn(),
}));

jest.mock("../../helpers/history/HistoryManager", () => jest.fn());

// 模擬 DOM 查詢
const mockContainer = {
	clientWidth: 800,
	clientHeight: 600,
};

describe("useCanvasInitialization", () => {
	let mockCanvas;
	let mockHistoryManager;
	let mockCanvasElement;
	let mockPinchZoomCleanup;
	let originalAddEventListener;
	let originalRemoveEventListener;
	let originalQuerySelector;

	beforeEach(() => {
		// 保存原始函數
		originalAddEventListener = window.addEventListener;
		originalRemoveEventListener = window.removeEventListener;
		originalQuerySelector = document.querySelector;

		// 模擬事件監聽器
		window.addEventListener = jest.fn();
		window.removeEventListener = jest.fn();

		// 模擬 DOM 查詢
		document.querySelector = jest.fn().mockReturnValue(mockContainer);

		// 創建模擬對象
		mockCanvas = {
			renderAll: jest.fn(),
			dispose: jest.fn(),
			historyManager: null,
		};

		mockHistoryManager = {
			saveState: jest.fn(),
			clear: jest.fn(),
			dispose: jest.fn(),
		};

		mockCanvasElement = document.createElement("canvas");
		mockPinchZoomCleanup = jest.fn();

		// 設置模擬返回值
		initializeCanvas.mockReturnValue(mockCanvas);
		createHistoryManager.mockReturnValue(mockHistoryManager);
		setupPinchZoom.mockReturnValue(mockPinchZoomCleanup);

		// 清除模擬調用記錄
		jest.clearAllMocks();
	});

	afterEach(() => {
		// 恢復原始函數
		window.addEventListener = originalAddEventListener;
		window.removeEventListener = originalRemoveEventListener;
		document.querySelector = originalQuerySelector;
	});

	test("應正確初始化畫布和設置事件監聽器", () => {
		const mockOnCanvasInit = jest.fn();
		
		// 模擬 renderHook 時立即設置 canvasRef
		let hookResult;
		renderHook(() => {
			hookResult = useCanvasInitialization({
				onCanvasInit: mockOnCanvasInit,
				clearTrigger: 0,
			});
			// 在 hook 執行過程中立即設置 canvasRef
			if (hookResult && hookResult.canvasRef) {
				hookResult.canvasRef.current = mockCanvasElement;
			}
			return hookResult;
		});

		// 驗證初始化函數被調用（可能使用 null 作為第一個參數）
		expect(initializeCanvas).toHaveBeenCalledWith(
			expect.anything(), // canvas ref 可能是 null 或 mockCanvasElement
			mockContainer.clientWidth,
			mockContainer.clientHeight
		);

		// 驗證歷史管理器被創建
		expect(createHistoryManager).toHaveBeenCalledWith(mockCanvas);
		expect(mockCanvas.historyManager).toBe(mockHistoryManager);
		expect(mockHistoryManager.saveState).toHaveBeenCalled();

		// 驗證回調被調用
		expect(mockOnCanvasInit).toHaveBeenCalledWith(mockCanvas);

		// 驗證 pinch zoom 設置
		expect(setupPinchZoom).toHaveBeenCalledWith(mockCanvas);

		// 驗證事件監聽器被添加
		expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

		// 驗證畫布渲染
		expect(mockCanvas.renderAll).toHaveBeenCalled();
	});

	test("應在清理時移除事件監聽器和釋放資源", () => {
		const { result, unmount } = renderHook(() =>
			useCanvasInitialization({
				onCanvasInit: jest.fn(),
				clearTrigger: 0,
			})
		);

		// 設置 canvasRef
		result.current.canvasRef.current = mockCanvasElement;

		// 清除模擬調用記錄
		jest.clearAllMocks();

		// 卸載 hook
		unmount();

		// 驗證清理函數被調用
		expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
		expect(mockPinchZoomCleanup).toHaveBeenCalled();
		expect(mockCanvas.dispose).toHaveBeenCalled();
		expect(mockHistoryManager.dispose).toHaveBeenCalled();
	});

	test("應響應 clearTrigger 變化清除畫布", () => {
		const { rerender } = renderHook(
			({ clearTrigger }) =>
				useCanvasInitialization({
					onCanvasInit: jest.fn(),
					clearTrigger,
				}),
			{
				initialProps: { clearTrigger: 0 },
			}
		);

		// 清除初始化時的調用記錄
		jest.clearAllMocks();

		// 觸發清除
		rerender({ clearTrigger: 1 });

		// 驗證清除函數被調用
		expect(mockHistoryManager.clear).toHaveBeenCalled();
		expect(clearCanvas).toHaveBeenCalledWith(mockCanvas);
	});

	test("應處理視窗大小變化", () => {
		const { result } = renderHook(() =>
			useCanvasInitialization({
				onCanvasInit: jest.fn(),
				clearTrigger: 0,
			})
		);

		// 設置 canvasRef
		result.current.canvasRef.current = mockCanvasElement;

		// 獲取 resize 事件處理器
		const resizeHandler = window.addEventListener.mock.calls.find(
			call => call[0] === "resize"
		)[1];

		// 清除模擬調用記錄
		jest.clearAllMocks();

		// 觸發 resize 事件
		resizeHandler();

		// 驗證 resize 處理邏輯
		expect(resizeCanvas).toHaveBeenCalledWith(
			mockCanvas,
			mockContainer.clientWidth,
			mockContainer.clientHeight
		);
		expect(mockCanvas.renderAll).toHaveBeenCalled();
	});

	test("應在沒有容器時使用視窗大小", () => {
		// 模擬沒有找到容器的情況
		document.querySelector.mockReturnValue(null);

		// 模擬視窗大小
		Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
		Object.defineProperty(window, "innerHeight", { value: 768, writable: true });

		renderHook(() =>
			useCanvasInitialization({
				onCanvasInit: jest.fn(),
				clearTrigger: 0,
			})
		);

		// 驗證使用視窗大小初始化
		expect(initializeCanvas).toHaveBeenCalledWith(
			null, // canvas ref 在測試環境中是 null
			1024 - 60, // window.innerWidth - 60
			768        // window.innerHeight
		);
	});

	test("應處理初始化錯誤", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		initializeCanvas.mockImplementation(() => {
			throw new Error("初始化失敗");
		});

		renderHook(() =>
			useCanvasInitialization({
				onCanvasInit: jest.fn(),
				clearTrigger: 0,
			})
		);

		expect(consoleSpy).toHaveBeenCalledWith("初始化畫布時發生錯誤:", expect.any(Error));
		consoleSpy.mockRestore();
	});

	test("應處理清理錯誤", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		mockCanvas.dispose.mockImplementation(() => {
			throw new Error("清理失敗");
		});

		const { unmount } = renderHook(() =>
			useCanvasInitialization({
				onCanvasInit: jest.fn(),
				clearTrigger: 0,
			})
		);

		unmount();

		expect(consoleSpy).toHaveBeenCalledWith("清理畫布資源時發生錯誤:", expect.any(Error));
		consoleSpy.mockRestore();
	});
});
