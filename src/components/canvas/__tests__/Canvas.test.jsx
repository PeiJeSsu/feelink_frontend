import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Canvas from "../Canvas";
import { initializeCanvas, resizeCanvas, clearCanvas, setDrawingMode } from "../../../helpers/canvas/CanvasOperations";
import { setPanningMode } from "../../../helpers/canvas/PanHelper";
import { createBrush, setupBrushEventListeners } from "../../../helpers/brush/BrushTools";
import { setupShapeDrawing } from "../../../helpers/shape/ShapeTools";
import { setupEraser } from "../../../helpers/eraser/ObjectEraserTools";
import { setupPathEraser } from "../../../helpers/eraser/PathEraserTools";
import createHistoryManager from "../../../helpers/history/HistoryManager";

// 模擬所有依賴的模組
jest.mock("../../../helpers/canvas/CanvasOperations", () => ({
	initializeCanvas: jest.fn(),
	resizeCanvas: jest.fn(),
	clearCanvas: jest.fn(),
	setDrawingMode: jest.fn(),
}));

jest.mock("../../../helpers/canvas/PanHelper", () => ({
	setPanningMode: jest.fn(),
}));

jest.mock("../../../helpers/brush/BrushTools", () => ({
	createBrush: jest.fn(),
	setupBrushEventListeners: jest.fn(),
}));

jest.mock("../../../helpers/shape/ShapeTools", () => ({
	setupShapeDrawing: jest.fn(),
	disableShapeDrawing: jest.fn(),
}));

jest.mock("../../../helpers/eraser/ObjectEraserTools", () => ({
	setupEraser: jest.fn(),
	disableEraser: jest.fn(),
}));

jest.mock("../../../helpers/eraser/PathEraserTools", () => ({
	setupPathEraser: jest.fn(),
	disablePathEraser: jest.fn(),
}));

jest.mock("../../../helpers/history/HistoryManager", () => jest.fn());

// 模擬子組件
jest.mock("../CanvasControls", () => {
	const MockCanvasControls = (props) => <div data-testid="canvas-controls">CanvasControls</div>;
	return MockCanvasControls;
});

jest.mock("../../chat/ChatSidebar", () => {
	const MockChatSidebar = () => <div data-testid="chat-sidebar">ChatSidebar</div>;
	return MockChatSidebar;
});

describe("Canvas 測試", () => {
	let mockCanvas;
	let mockHistoryManager;
	let originalAddEventListener;
	let originalRemoveEventListener;

	beforeEach(() => {
		// 保存原始的事件監聽器函數
		originalAddEventListener = window.addEventListener;
		originalRemoveEventListener = window.removeEventListener;

		// 模擬事件監聽器函數
		window.addEventListener = jest.fn();
		window.removeEventListener = jest.fn();

		mockCanvas = {
			renderAll: jest.fn(),
			dispose: jest.fn(),
			historyManager: null,
		};
		mockHistoryManager = {
			saveState: jest.fn(),
			clear: jest.fn(),
		};

		initializeCanvas.mockReturnValue(mockCanvas);
		createHistoryManager.mockReturnValue(mockHistoryManager);

		// 重置所有模擬
		jest.clearAllMocks();
	});

	afterEach(() => {
		// 恢復原始的事件監聽器函數
		window.addEventListener = originalAddEventListener;
		window.removeEventListener = originalRemoveEventListener;
	});

	test("應初始化畫布和歷史管理器", () => {
		const mockOnCanvasInit = jest.fn();
		render(
			<Canvas
				activeTool="pencil"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{}}
				clearTrigger={0}
				onCanvasInit={mockOnCanvasInit}
			/>
		);

		expect(initializeCanvas).toHaveBeenCalled();
		expect(createHistoryManager).toHaveBeenCalledWith(mockCanvas);
		expect(mockCanvas.historyManager).toBe(mockHistoryManager);
		expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();
		expect(mockOnCanvasInit).toHaveBeenCalledWith(mockCanvas);
	});

	test("應設置視窗大小調整事件監聽器", () => {
		render(<Canvas activeTool="pencil" brushSettings={{}} shapeSettings={{}} eraserSettings={{}} clearTrigger={0} />);

		expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

		// 找到註冊的 resize 處理函數
		const resizeHandler = window.addEventListener.mock.calls.find((call) => call[0] === "resize")[1];

		// 手動調用 resize 處理函數
		resizeHandler();

		expect(resizeCanvas).toHaveBeenCalled();
		expect(mockCanvas.renderAll).toHaveBeenCalled();
	});

	test("應根據工具設置畫布模式", () => {
		const { rerender } = render(
			<Canvas
				activeTool="pencil"
				brushSettings={{ type: "pencil" }}
				shapeSettings={{}}
				eraserSettings={{}}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);

		expect(setDrawingMode).toHaveBeenCalledWith(mockCanvas, true);
		expect(createBrush).toHaveBeenCalledWith(mockCanvas, "pencil", expect.any(Object));
		expect(setupBrushEventListeners).toHaveBeenCalledWith(mockCanvas, expect.any(Object));

		// 重置模擬
		jest.clearAllMocks();

		rerender(
			<Canvas
				activeTool="shape"
				brushSettings={{}}
				shapeSettings={{ type: "rectangle" }}
				eraserSettings={{}}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setDrawingMode).toHaveBeenCalledWith(mockCanvas, false);
		expect(setupShapeDrawing).toHaveBeenCalledWith(mockCanvas, expect.any(Object));

		// 重置模擬
		jest.clearAllMocks();

		rerender(
			<Canvas
				activeTool="eraser"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{ type: "object", size: 10 }}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setDrawingMode).toHaveBeenCalledWith(mockCanvas, false);
		expect(setupEraser).toHaveBeenCalledWith(mockCanvas, expect.any(Object));

		// 重置模擬
		jest.clearAllMocks();

		rerender(
			<Canvas
				activeTool="pan"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{}}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setDrawingMode).toHaveBeenCalledWith(mockCanvas, false);
		expect(setPanningMode).toHaveBeenCalledWith(mockCanvas, true);
	});

	test("應響應 clearTrigger 清除畫布", () => {
		const { rerender } = render(
			<Canvas
				activeTool="pencil"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{}}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);

		// 重置模擬，確保我們只測試新的調用
		jest.clearAllMocks();

		rerender(
			<Canvas
				activeTool="pencil"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{}}
				clearTrigger={1}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(clearCanvas).toHaveBeenCalledWith(mockCanvas);
		expect(mockHistoryManager.clear).toHaveBeenCalled();
	});

	test("應更新橡皮擦大小", () => {
		// 首先用舊的橡皮擦設置渲染
		const { rerender } = render(
			<Canvas
				activeTool="eraser"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{ type: "object", size: 10 }}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);

		// 模擬橡皮擦物件
		const mockObjectEraser = {
			updateSize: jest.fn(),
		};
		setupEraser.mockReturnValue(mockObjectEraser);

		const mockPathEraser = {
			updateSize: jest.fn(),
		};
		setupPathEraser.mockReturnValue(mockPathEraser);

		// 清除模擬調用記錄
		jest.clearAllMocks();

		// 用物件橡皮擦重新渲染
		rerender(
			<Canvas
				activeTool="eraser"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{ type: "object", size: 20 }}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setupEraser).toHaveBeenCalledWith(mockCanvas, expect.objectContaining({ size: 20 }));

		// 清除模擬調用記錄
		jest.clearAllMocks();

		// 用路徑橡皮擦重新渲染
		rerender(
			<Canvas
				activeTool="eraser"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{ type: "path", size: 15 }}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setupPathEraser).toHaveBeenCalledWith(mockCanvas, expect.objectContaining({ size: 15 }));
	});

	test("應在卸載時清理資源", () => {
		const { unmount } = render(
			<Canvas
				activeTool="pencil"
				brushSettings={{}}
				shapeSettings={{}}
				eraserSettings={{}}
				clearTrigger={0}
				onCanvasInit={jest.fn()}
			/>
		);

		// 重置模擬調用記錄
		jest.clearAllMocks();

		// 卸載組件
		unmount();

		// 驗證清理事件監聽器
		expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

		// 驗證畫布被釋放
		expect(mockCanvas.dispose).toHaveBeenCalled();
	});
});
