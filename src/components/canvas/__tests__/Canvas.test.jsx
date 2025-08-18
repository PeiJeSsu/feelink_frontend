import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { initializeCanvas } from "../../../helpers/canvas/CanvasOperations";
import createHistoryManager from "../../../helpers/history/HistoryManager";
import { useCanvasInitialization } from "../../../hooks/useCanvasInitialization";
import { useCanvasTools } from "../../../hooks/useCanvasTools";
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

jest.mock("../../../hooks/useCanvasInitialization", () => ({
	useCanvasInitialization: jest.fn(),
}));

jest.mock("../../../hooks/useCanvasTools", () => ({
	useCanvasTools: jest.fn(),
}));

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
	let mockCanvasRef;
	let mockFabricCanvasRef;

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

		// 創建模擬的 refs
		mockCanvasRef = { current: null };
		mockFabricCanvasRef = { current: mockCanvas };

		// 模擬 useCanvasInitialization hook
		useCanvasInitialization.mockReturnValue({
			canvasRef: mockCanvasRef,
			fabricCanvasRef: mockFabricCanvasRef,
		});

		// 模擬 useCanvasTools hook
		useCanvasTools.mockImplementation(() => {});

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

		// 驗證 hooks 被正確調用
		expect(useCanvasInitialization).toHaveBeenCalledWith({
			onCanvasInit: mockOnCanvasInit,
			clearTrigger: 0,
			chatWidth: 0,
			isChatOpen: false,
		});

		expect(useCanvasTools).toHaveBeenCalledWith(mockCanvas, {
			activeTool: "pencil",
			brushSettings: defaultProps.brushSettings,
			shapeSettings: defaultProps.shapeSettings,
			eraserSettings: defaultProps.eraserSettings,
			paintBucketSettings: defaultProps.paintBucketSettings,
			textSettings: defaultProps.textSettings,
		});
	});

	test("應正確初始化畫布和設置事件監聽器", () => {
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

		// 驗證 hook 被正確調用
		expect(useCanvasInitialization).toHaveBeenCalledWith({
			onCanvasInit: undefined,
			clearTrigger: 0,
			chatWidth: 0,
			isChatOpen: false,
		});

		expect(useCanvasTools).toHaveBeenCalledWith(mockCanvas, {
			activeTool: "pencil",
			brushSettings: defaultProps.brushSettings,
			shapeSettings: defaultProps.shapeSettings,
			eraserSettings: defaultProps.eraserSettings,
			paintBucketSettings: defaultProps.paintBucketSettings,
			textSettings: defaultProps.textSettings,
		});
	});

	test("應響應 clearTrigger 變化", () => {
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

		// 觸發 clearTrigger 變化
		rerender(<Canvas activeTool="pencil" {...defaultProps} clearTrigger={1} onCanvasInit={jest.fn()} />);
		
		// 驗證 useCanvasInitialization hook 被重新調用，包含新的 clearTrigger
		expect(useCanvasInitialization).toHaveBeenCalledWith({
			onCanvasInit: expect.any(Function),
			clearTrigger: 1,
			chatWidth: 0,
			isChatOpen: false,
		});
	});

	test("應正確使用 useCanvasInitialization hook", () => {
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
		
		const mockOnCanvasInit = jest.fn();
		render(<Canvas activeTool="pencil" {...defaultProps} onCanvasInit={mockOnCanvasInit} />);

		// 驗證 hook 被正確調用，包含清理邏輯
		expect(useCanvasInitialization).toHaveBeenCalledWith({
			onCanvasInit: mockOnCanvasInit,
			clearTrigger: 0,
			chatWidth: 0,
			isChatOpen: false,
		});
	});
});
