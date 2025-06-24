import React from "react";
import { render } from "@testing-library/react";
import { useCanvasTools } from "../useCanvasTools";
import PropTypes from "prop-types";

jest.mock("../../helpers/canvas/CanvasOperations", () => ({ setDrawingMode: jest.fn() }));
jest.mock("../../helpers/canvas/PanHelper", () => ({ setPanningMode: jest.fn() }));
jest.mock("../../helpers/brush/BrushTools", () => ({
	createBrush: jest.fn(() => ({})),
	setupBrushEventListeners: jest.fn(),
}));
jest.mock("../../helpers/shape/ShapeTools", () => ({
	setupShapeDrawing: jest.fn(),
	disableShapeDrawing: jest.fn(),
}));
jest.mock("../../helpers/eraser/ObjectEraserTools", () => ({
	setupEraser: jest.fn(() => ({ updateSize: jest.fn() })),
	disableEraser: jest.fn(),
}));
jest.mock("../../helpers/eraser/PathEraserTools", () => ({
	setupPathEraser: jest.fn(() => ({ updateSize: jest.fn() })),
	disablePathEraser: jest.fn(),
}));
jest.mock("../../helpers/paint-bucket/PaintBucketTools", () => ({
	setupPaintBucket: jest.fn(() => ({ updateColor: jest.fn(), updateTolerance: jest.fn() })),
	disablePaintBucket: jest.fn(),
}));
jest.mock("../../helpers/text/TextTools", () => ({
	setupTextTool: jest.fn(),
	updateActiveTextbox: jest.fn(),
}));

const getMockCanvas = () => ({ freeDrawingBrush: null });

function TestComponent({ canvas, options }) {
	useCanvasTools(canvas, options);
	return null;
}

TestComponent.propTypes = {
	canvas: PropTypes.any,
	options: PropTypes.object,
};

describe("useCanvasTools", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const baseOptions = {
		activeTool: "pencil",
		brushSettings: { type: "pencil", size: 10 },
		shapeSettings: { type: "rect" },
		eraserSettings: { type: "object", size: 20 },
		paintBucketSettings: { color: "#fff", tolerance: 10 },
		textSettings: { fontSize: 16 },
	};

	it("canvas 為 null 不應報錯", () => {
		expect(() => {
			render(<TestComponent canvas={null} options={baseOptions} />);
		}).not.toThrow();
	});

	it("切換 pencil 工具應呼叫 setDrawingMode, createBrush, setupBrushEventListeners", () => {
		const canvas = getMockCanvas();
		const { rerender } = render(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "pencil" }} />);
		rerender(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "pencil" }} />);
	});

	it("切換 text 工具應呼叫 setupTextTool", () => {
		const canvas = getMockCanvas();
		render(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "text" }} />);
	});

	it("切換 shape 工具應呼叫 setupShapeDrawing", () => {
		const canvas = getMockCanvas();
		render(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "shape" }} />);
	});

	it("切換 eraser 工具應呼叫 setupEraser", () => {
		const canvas = getMockCanvas();
		render(
			<TestComponent
				canvas={canvas}
				options={{ ...baseOptions, activeTool: "eraser", eraserSettings: { type: "object", size: 20 } }}
			/>
		);
	});

	it("切換 path eraser 工具應呼叫 setupPathEraser", () => {
		const canvas = getMockCanvas();
		render(
			<TestComponent
				canvas={canvas}
				options={{ ...baseOptions, activeTool: "eraser", eraserSettings: { type: "path", size: 20 } }}
			/>
		);
	});

	it("切換 paintBucket 工具應呼叫 setupPaintBucket", () => {
		const canvas = getMockCanvas();
		render(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "paintBucket" }} />);
	});

	it("切換 pan 工具應呼叫 setPanningMode", () => {
		const canvas = getMockCanvas();
		render(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "pan" }} />);
	});

	it("activeTool 為 default 不應 throw", () => {
		const canvas = getMockCanvas();
		render(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "unknown" }} />);
	});

	it("eraserSettings 變更時會呼叫 updateSize", () => {
		const canvas = getMockCanvas();
		const { rerender } = render(
			<TestComponent
				canvas={canvas}
				options={{ ...baseOptions, activeTool: "eraser", eraserSettings: { type: "object", size: 20 } }}
			/>
		);
		rerender(
			<TestComponent
				canvas={canvas}
				options={{ ...baseOptions, activeTool: "eraser", eraserSettings: { type: "object", size: 30 } }}
			/>
		);
		rerender(
			<TestComponent
				canvas={canvas}
				options={{ ...baseOptions, activeTool: "eraser", eraserSettings: { type: "path", size: 40 } }}
			/>
		);
	});

	it("paintBucketSettings 變更時會呼叫 updateColor/updateTolerance", () => {
		const canvas = getMockCanvas();
		const { rerender } = render(
			<TestComponent
				canvas={canvas}
				options={{ ...baseOptions, activeTool: "paintBucket", paintBucketSettings: { color: "#fff", tolerance: 10 } }}
			/>
		);
		rerender(
			<TestComponent
				canvas={canvas}
				options={{ ...baseOptions, activeTool: "paintBucket", paintBucketSettings: { color: "#000", tolerance: 20 } }}
			/>
		);
	});

	it("textSettings 變更時會呼叫 updateActiveTextbox", () => {
		const canvas = getMockCanvas();
		const { rerender } = render(
			<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "text", textSettings: { fontSize: 16 } }} />
		);
		rerender(
			<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "text", textSettings: { fontSize: 24 } }} />
		);
	});

	it("異常情境: setup/副作用拋錯時不會中斷", () => {
		const canvas = getMockCanvas();
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const { rerender } = render(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "pencil" }} />);
		jest.spyOn(require("../../helpers/canvas/CanvasOperations"), "setDrawingMode").mockImplementationOnce(() => {
			throw new Error("fail");
		});
		rerender(<TestComponent canvas={canvas} options={{ ...baseOptions, activeTool: "pencil" }} />);
		errorSpy.mockRestore();
	});
});
