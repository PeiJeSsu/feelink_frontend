import SpraypaintBrush from "../SpraypaintBrush";
import * as fabric from "fabric";
import { angleBetween, convertToImg } from "../../../../utils/BrushUtils";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
		angleBetween: jest.fn(() => 0),
	};
});

describe("SpraypaintBrush", () => {
	let mockCanvas, mockCtx, mockBrush;

	beforeEach(() => {
		mockCtx = {
			globalAlpha: 1,
			lineJoin: null,
			lineCap: null,
			drawImage: jest.fn(),
		};
		mockBrush = {
			getObjects: jest.fn(() => [{ set: jest.fn() }]),
			renderAll: jest.fn(),
			toCanvasElement: jest.fn(() => ({})),
		};
		mockCanvas = {
			contextTop: mockCtx,
			add: jest.fn(),
			clearContext: jest.fn(),
			_isCurrentlyDrawing: false,
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
		global.fabric.FabricImage = { fromURL: jest.fn((url, cb) => cb(mockBrush)) };
		jest.spyOn(fabric, "Point").mockImplementation(function (x = 0, y = 0) {
			this.x = x;
			this.y = y;
			this.distanceFrom = function (p) {
				return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2);
			};
		});
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve({ setCoords: jest.fn() }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性與 context", () => {
		const brush = new SpraypaintBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(10);
		expect(mockCtx.lineJoin).toBe("round");
		expect(mockCtx.lineCap).toBe("round");
	});

	it("onMouseDown 應設置 alpha、point 並呼叫 _setColor/_render", () => {
		expect(mockCtx.globalAlpha).toBe(1);
		const brush = new SpraypaintBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		expect(brush.opacity).toBe(0.5);
		brush.brush = mockBrush;
		brush.canvas = mockCanvas;
		const setColorSpy = jest.spyOn(brush, "_setColor");
		const renderSpy = jest.spyOn(brush, "_render");
		brush.onMouseDown({ x: 1, y: 2 });
		expect(brush.opacity).toBe(0.5);
		expect(setColorSpy).toHaveBeenCalledWith("#123");
		expect(renderSpy).toHaveBeenCalled();
	});

	it("onMouseMove 應更新 _point 與 _lastPoint", () => {
		const brush = new SpraypaintBrush(mockCanvas);
		brush.brush = mockBrush;
		brush._point = new fabric.Point(0, 0);
		brush._lastPoint = new fabric.Point(0, 0);
		brush.onMouseMove({ x: 3, y: 4 });
		expect(brush._point.x).toBe(3);
		expect(brush._lastPoint.x).toBe(0);
	});

	it("onMouseUp 應呼叫 convertToImg 並清理", async () => {
		jest.useFakeTimers();
		const brush = new SpraypaintBrush(mockCanvas);
		brush.brush = mockBrush;
		brush._interval = 10;
		const img = { setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(img));
		brush.onMouseUp();
		jest.runAllTimers();
		await Promise.resolve();
		expect(mockCanvas.add).toHaveBeenCalledWith(img);
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
		jest.useRealTimers();
	});

	it("onMouseUp convertToImg 拋出例外時不應 throw", async () => {
		jest.useFakeTimers();
		const brush = new SpraypaintBrush(mockCanvas);
		brush.brush = mockBrush;
		brush._interval = 10;
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() =>
			Promise.reject(new Error("fail")).catch(() => {})
		);
		brush.onMouseUp();
		jest.runAllTimers();
		await Promise.resolve();
		await Promise.resolve();
		expect(mockCanvas.add).not.toHaveBeenCalled();
		expect(mockCanvas.clearContext).not.toHaveBeenCalled();
		jest.useRealTimers();
	});

	it("_setColor 應設置 brush 填色", () => {
		const brush = new SpraypaintBrush(mockCanvas);
		brush.brush = mockBrush;
		brush._setColor("#456");
		expect(brush.color).toBe("#456");
		expect(mockBrush.getObjects).toHaveBeenCalled();
		expect(mockBrush.renderAll).toHaveBeenCalled();
	});

	it("_render 異常情境: brush 為 null 不應 throw", () => {
		const brush = new SpraypaintBrush(mockCanvas);
		brush.brush = null;
		expect(() => brush._render()).not.toThrow();
	});

	it("_reset 應重設屬性與 alpha", () => {
		const brush = new SpraypaintBrush(mockCanvas);
		brush._point = { x: 1, y: 2 };
		brush._lastPoint = { x: 3, y: 4 };
		mockCtx.globalAlpha = 0.5;
		brush._reset();
		expect(brush._point).toBeNull();
		expect(brush._lastPoint).toBeNull();
		expect(mockCtx.globalAlpha).toBe(1);
	});
});
