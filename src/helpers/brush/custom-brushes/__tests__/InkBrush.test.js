import InkBrush from "../InkBrush";
import * as fabric from "fabric";
import Stroke from "../../../../utils/StrokeUtils";
import { colorValues, convertToImg } from "../../../../utils/BrushUtils";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
		colorValues: jest.fn(),
	};
});

describe("InkBrush", () => {
	let mockCanvas, mockCtx;

	beforeEach(() => {
		mockCtx = {
			save: jest.fn(),
			restore: jest.fn(),
			fill: jest.fn(),
			beginPath: jest.fn(),
			arc: jest.fn(),
			fillStyle: null,
			drawImage: jest.fn(),
			getImageData: jest.fn(() => ({ data: new Array(10000).fill(0) })),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			stroke: jest.fn(),
			strokeStyle: null,
			lineWidth: null,
		};
		mockCanvas = {
			contextTop: mockCtx,
			add: jest.fn(),
			clearContext: jest.fn(),
			_isCurrentlyDrawing: true,
			getRetinaScaling: jest.fn(() => 1),
			upperCanvasEl: { width: 100, height: 100 },
		};
		global.document.createElement = jest.fn((tag) => {
			if (tag === "canvas") {
				return {
					width: 0,
					height: 0,
					getContext: jest.fn(() => mockCtx),
					toDataURL: jest.fn(() => "data:image/png;base64,xxx"),
				};
			}
			return {};
		});
		global.fabric = global.fabric || {};
		global.fabric.FabricImage = { fromURL: jest.fn((url) => Promise.resolve({ set: jest.fn(), setCoords: jest.fn() })) };
		jest.spyOn(fabric, "Point").mockImplementation(function (x = 0, y = 0) {
			this.x = x;
			this.y = y;
			this.subtract = function (p) {
				return new fabric.Point(this.x - p.x, this.y - p.y);
			};
			this.distanceFrom = function (p) {
				return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2);
			};
		});
		jest.spyOn(convertToImg, "bind").mockReturnValue(() => Promise.resolve({ setCoords: jest.fn() }));
		jest.spyOn(colorValues, "bind").mockReturnValue(() => 1);
		jest.spyOn(Stroke.prototype, "update").mockImplementation(() => {});
		jest.spyOn(Stroke.prototype, "draw").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new InkBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(10);
	});

	it("onMouseDown 應設置 alpha 並重設 tip", () => {
		const brush = new InkBrush(mockCanvas, { width: 20 });
		const resetSpy = jest.spyOn(brush, "_resetTip");
		brush.onMouseDown({ x: 1, y: 2 });
		expect(mockCtx.globalAlpha).toBe(brush.opacity);
		expect(resetSpy).toHaveBeenCalled();
	});

	it("onMouseMove 在繪圖時應呼叫 _render", () => {
		const brush = new InkBrush(mockCanvas);
		brush._strokes = [new Stroke(mockCtx, { x: 0, y: 0 }, 1, "#000", 1, 1)];
		brush._lastPoint = new fabric.Point(0, 0);
		const renderSpy = jest.spyOn(brush, "_render");
		brush._point = new fabric.Point(0, 0);
		brush.onMouseMove({ x: 3, y: 4 });
		expect(renderSpy).toHaveBeenCalled();
	});

	it("onMouseMove 不在繪圖時不呼叫 _render", () => {
		mockCanvas._isCurrentlyDrawing = false;
		const brush = new InkBrush(mockCanvas);
		const renderSpy = jest.spyOn(brush, "_render");
		brush.onMouseMove({ x: 3, y: 4 });
		expect(renderSpy).not.toHaveBeenCalled();
	});

	it("onMouseUp 應呼叫 convertToImg 並清理", async () => {
		const brush = new InkBrush(mockCanvas);
		brush._strokes = [new Stroke(mockCtx, { x: 0, y: 0 }, 1, "#000", 1, 1)];
		brush._lastPoint = new fabric.Point(0, 0);
		const img = { set: jest.fn(), setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(img));
		await brush.onMouseUp();
		expect(mockCanvas.add).toHaveBeenCalled();
		expect(mockCanvas.add.mock.calls[0][0]).toBe(img);
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
		expect(mockCtx.globalAlpha).toBe(1);
	});

	it("_render 應呼叫 stroke.update 與 draw，距離大於30時呼叫 drawSplash", () => {
		const brush = new InkBrush(mockCanvas);
		brush._strokes = [new Stroke(mockCtx, { x: 0, y: 0 }, 1, "#000", 1, 1)];
		brush._lastPoint = new fabric.Point(0, 0);
		const splashSpy = jest.spyOn(brush, "drawSplash");
		brush._inkAmount = 2;
		brush._point = new fabric.Point(0, 0);
		brush._render({ x: 100, y: 0 });
		expect(splashSpy).toHaveBeenCalled();
	});

	it("drawSplash 應呼叫 ctx.arc 與 fill", () => {
		const brush = new InkBrush(mockCanvas);
		brush.color = "#abc";
		brush.drawSplash({ x: 10, y: 10 }, 2);
		expect(mockCtx.arc).toHaveBeenCalled();
		expect(mockCtx.fill).toHaveBeenCalled();
	});

	it("setPointer 應正確設置 _lastPoint 與 _point", () => {
		const brush = new InkBrush(mockCanvas);
		const p = brush.setPointer({ x: 5, y: 6 });
		expect(brush._point.x).toBe(5);
		expect(brush._lastPoint).not.toBeNull();
		expect(p.x).toBe(5);
	});

	it("_resetTip 應初始化 strokes 陣列", () => {
		const brush = new InkBrush(mockCanvas, { width: 10 });
		const pointer = { x: 1, y: 2 };
		brush._resetTip(pointer);
		expect(Array.isArray(brush._strokes)).toBe(true);
		expect(brush._strokes.length).toBeGreaterThan(0);
	});

	it("_render 異常情境: _strokes 為空不應 throw", () => {
		const brush = new InkBrush(mockCanvas);
		brush._strokes = [];
		brush._lastPoint = new fabric.Point(0, 0);
		brush._point = new fabric.Point(0, 0);
		expect(() => brush._render({ x: 1, y: 1 })).not.toThrow();
	});
});
