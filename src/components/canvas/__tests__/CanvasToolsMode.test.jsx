import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { setDrawingMode } from "../../../helpers/canvas/CanvasOperations";
import { setPanningMode } from "../../../helpers/canvas/PanHelper";
import { createBrush, setupBrushEventListeners } from "../../../helpers/brush/BrushTools";
import { setupShapeDrawing } from "../../../helpers/shape/ShapeTools";
import { setupEraser } from "../../../helpers/eraser/ObjectEraserTools";
import { setupPathEraser } from "../../../helpers/eraser/PathEraserTools";

// 先 mock useCanvasInitialization
jest.mock("../../../hooks/useCanvasInitialization", () => ({
	useCanvasInitialization: () => ({
		canvasRef: { current: {} },
		fabricCanvasRef: { current: mockCanvas },
	}),
}));

// 其他依賴的 mock
jest.mock("../../../helpers/canvas/CanvasOperations", () => {
	const actual = jest.requireActual("../../../helpers/canvas/CanvasOperations");
	const setDrawingMode = jest.fn((canvas, isDrawingMode) => {
		canvas.isDrawingMode = isDrawingMode;
	});
	return {
		...actual,
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

// 子組件 mock
jest.mock("../CanvasControls", () => {
	const MockCanvasControls = (props) => <div data-testid="canvas-controls">CanvasControls</div>;
	return MockCanvasControls;
});

// 全域 mockCanvas
const mockCanvas = {
	renderAll: jest.fn(),
	dispose: jest.fn(),
	historyManager: null,
	isDrawingMode: false,
};

const Canvas = require("../Canvas").default;

describe("Canvas 工具模式/橡皮擦 mock（獨立檔案）", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCanvas.isDrawingMode = false;
	});
	test("應根據工具設置畫布模式", () => {
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
		expect(setDrawingMode).toHaveBeenCalledWith(expect.any(Object), true);
		expect(createBrush).toHaveBeenCalledWith(expect.any(Object), "pencil", expect.any(Object));
		expect(setupBrushEventListeners).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
		jest.clearAllMocks();
		rerender(
			<Canvas
				activeTool="shape"
				{...defaultProps}
				shapeSettings={{ type: "rectangle", fill: "#fff", stroke: "#000", strokeWidth: 1 }}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setDrawingMode).toHaveBeenCalledWith(expect.any(Object), false);
		expect(setupShapeDrawing).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
		jest.clearAllMocks();
		rerender(
			<Canvas
				activeTool="eraser"
				{...defaultProps}
				eraserSettings={{ type: "object", size: 10 }}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setDrawingMode).toHaveBeenCalledWith(expect.any(Object), false);
		expect(setupEraser).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
		jest.clearAllMocks();
		rerender(<Canvas activeTool="pan" {...defaultProps} onCanvasInit={jest.fn()} />);
		expect(setDrawingMode).toHaveBeenCalledWith(expect.any(Object), false);
		expect(setPanningMode).toHaveBeenCalledWith(expect.any(Object), true);
	});
	test("應更新橡皮擦大小", () => {
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
		const { rerender } = render(<Canvas activeTool="eraser" {...defaultProps} onCanvasInit={jest.fn()} />);
		const mockObjectEraser = { updateSize: jest.fn() };
		setupEraser.mockReturnValue(mockObjectEraser);
		const mockPathEraser = { updateSize: jest.fn() };
		setupPathEraser.mockReturnValue(mockPathEraser);
		jest.clearAllMocks();
		rerender(
			<Canvas
				activeTool="eraser"
				{...defaultProps}
				eraserSettings={{ type: "object", size: 20 }}
				onCanvasInit={jest.fn()}
			/>
		);
		expect(setupEraser).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ size: 20 }));
		jest.clearAllMocks();
		rerender(
			<Canvas activeTool="eraser" {...defaultProps} eraserSettings={{ type: "path", size: 15 }} onCanvasInit={jest.fn()} />
		);
		expect(setupPathEraser).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ size: 15 }));
	});
});
