import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { initializeCanvas, resizeCanvas, clearCanvas, setDrawingMode } from "../../../helpers/canvas/CanvasOperations";
import { setPanningMode } from "../../../helpers/canvas/PanHelper";
import { createBrush, setupBrushEventListeners } from "../../../helpers/brush/BrushTools";
import { setupShapeDrawing } from "../../../helpers/shape/ShapeTools";
import { setupEraser } from "../../../helpers/eraser/ObjectEraserTools";
import { setupPathEraser } from "../../../helpers/eraser/PathEraserTools";
import createHistoryManager from "../../../helpers/history/HistoryManager";
import Canvas from "../Canvas";

// 模擬所有依賴的模組
jest.mock("../../../helpers/canvas/CanvasOperations", () => {
	const actual = jest.requireActual("../../../helpers/canvas/CanvasOperations");
	const setDrawingMode = jest.fn((canvas, isDrawingMode) => {
		console.log("setDrawingMode called", canvas, isDrawingMode);
		canvas.isDrawingMode = isDrawingMode;
	});
	return {
		...actual,
		initializeCanvas: jest.fn(),
		resizeCanvas: jest.fn(),
		clearCanvas: jest.fn(),
		setDrawingMode,
	};
});

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

const mockCanvas = {
	renderAll: jest.fn(),
	dispose: jest.fn(),
	historyManager: null,
	isDrawingMode: false,
};

describe("Canvas 測試（一般流程）", () => {
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

		mockCanvas.renderAll.mockClear();
		mockCanvas.dispose.mockClear();
		mockCanvas.historyManager = null;
		mockCanvas.isDrawingMode = false;

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
		jest.resetModules(); // 確保每次測試都能重新 mock
	});

	test("應初始化畫布和歷史管理器", () => {
		const mockOnCanvasInit = jest.fn();
		const defaultProps = {
			brushSettings: {
				type: "pencil",
				color: "#000000",
				width: 1,
				opacity: 1,
				shadow: { blur: 0, offsetX: 0, offsetY: 0, color: "#000000" },
			},
			shapeSettings: { type: "rectangle", fill: "#fff", stroke: "#000", strokeWidth: 1 },
			eraserSettings: { type: "object", size: 10 },
			paintBucketSettings: { color: "#fff", tolerance: 10 },
			textSettings: { fontFamily: "Arial", fontSize: 12, fill: "#000", textAlign: "left" },
			clearTrigger: 0,
		};
		render(<Canvas activeTool="pencil" {...defaultProps} onCanvasInit={mockOnCanvasInit} />);

		expect(initializeCanvas).toHaveBeenCalled();
		expect(createHistoryManager).toHaveBeenCalledWith(mockCanvas);
		expect(mockCanvas.historyManager).toBe(mockHistoryManager);
		expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();
		expect(mockOnCanvasInit).toHaveBeenCalledWith(mockCanvas);
	});

	test("應設置視窗大小調整事件監聽器", () => {
		const defaultProps = {
			brushSettings: {
				type: "pencil",
				color: "#000000",
				width: 1,
				opacity: 1,
				shadow: { blur: 0, offsetX: 0, offsetY: 0, color: "#000000" },
			},
			shapeSettings: { type: "rectangle", fill: "#fff", stroke: "#000", strokeWidth: 1 },
			eraserSettings: { type: "object", size: 10 },
			paintBucketSettings: { color: "#fff", tolerance: 10 },
			textSettings: { fontFamily: "Arial", fontSize: 12, fill: "#000", textAlign: "left" },
			clearTrigger: 0,
		};
		render(<Canvas activeTool="pencil" {...defaultProps} />);

		expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

		// 找到註冊的 resize 處理函數
		const resizeHandler = window.addEventListener.mock.calls.find((call) => call[0] === "resize")[1];

		// 手動調用 resize 處理函數
		resizeHandler();

		expect(resizeCanvas).toHaveBeenCalled();
		expect(mockCanvas.renderAll).toHaveBeenCalled();
	});

	test("應響應 clearTrigger 清除畫布", () => {
		const defaultProps = {
			brushSettings: {
				type: "pencil",
				color: "#000000",
				width: 1,
				opacity: 1,
				shadow: { blur: 0, offsetX: 0, offsetY: 0, color: "#000000" },
			},
			shapeSettings: { type: "rectangle", fill: "#fff", stroke: "#000", strokeWidth: 1 },
			eraserSettings: { type: "object", size: 10 },
			paintBucketSettings: { color: "#fff", tolerance: 10 },
			textSettings: { fontFamily: "Arial", fontSize: 12, fill: "#000", textAlign: "left" },
			clearTrigger: 0,
		};
		const { rerender } = render(<Canvas activeTool="pencil" {...defaultProps} onCanvasInit={jest.fn()} />);

		// 重置模擬，確保我們只測試新的調用
		jest.clearAllMocks();

		rerender(<Canvas activeTool="pencil" {...defaultProps} clearTrigger={1} onCanvasInit={jest.fn()} />);
		expect(clearCanvas).toHaveBeenCalledWith(mockCanvas);
		expect(mockHistoryManager.clear).toHaveBeenCalled();
	});

	test("應在卸載時清理資源", () => {
		const defaultProps = {
			brushSettings: {
				type: "pencil",
				color: "#000000",
				width: 1,
				opacity: 1,
				shadow: { blur: 0, offsetX: 0, offsetY: 0, color: "#000000" },
			},
			shapeSettings: { type: "rectangle", fill: "#fff", stroke: "#000", strokeWidth: 1 },
			eraserSettings: { type: "object", size: 10 },
			paintBucketSettings: { color: "#fff", tolerance: 10 },
			textSettings: { fontFamily: "Arial", fontSize: 12, fill: "#000", textAlign: "left" },
			clearTrigger: 0,
		};
		const { unmount } = render(<Canvas activeTool="pencil" {...defaultProps} onCanvasInit={jest.fn()} />);

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
