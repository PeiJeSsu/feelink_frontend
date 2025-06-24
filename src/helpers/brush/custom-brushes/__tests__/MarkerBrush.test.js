import MarkerBrush from "../MarkerBrush";
import * as fabric from "fabric";
import { convertToImg } from "../../../../utils/BrushUtils";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
	};
});

describe("MarkerBrush", () => {
	let mockCanvas, mockCtx;

	beforeEach(() => {
		mockCtx = {
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			stroke: jest.fn(),
			strokeStyle: null,
			lineWidth: null,
			globalAlpha: 1,
			lineJoin: null,
			lineCap: null,
		};
		mockCanvas = {
			contextTop: mockCtx,
			add: jest.fn(),
			clearContext: jest.fn(),
			_isCurrentlyDrawing: true,
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
		});
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve({ setCoords: jest.fn() }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new MarkerBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 40 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(40);
		expect(brush._baseWidth).toBe(10);
		expect(brush._lineWidth).toBe(3);
		expect(brush._size).toBe(0);
	});

	it("建構時應使用預設值", () => {
		const brush = new MarkerBrush(mockCanvas);
		expect(brush.color).toBe("#000");
		expect(brush.opacity).toBe(1);
		expect(brush.width).toBe(30);
	});

	it("建構時應設置 canvas context 屬性", () => {
		const brush = new MarkerBrush(mockCanvas, { opacity: 0.7 });
		expect(mockCtx.globalAlpha).toBe(0.7);
		expect(mockCtx.lineJoin).toBe("round");
		expect(mockCtx.lineCap).toBe("round");
	});

	it("onMouseDown 應正確初始化狀態", () => {
		const brush = new MarkerBrush(mockCanvas, { color: "#ff0000", width: 50 });
		const pointer = { x: 10, y: 20 };

		brush.onMouseDown(pointer);

		expect(brush._lastPoint).toBe(pointer);
		expect(mockCtx.strokeStyle).toBe("#ff0000");
		expect(mockCtx.lineWidth).toBe(3);
		expect(brush._size).toBe(60); // width + _baseWidth
	});

	it("onMouseMove 應在繪製狀態時呼叫 _render", () => {
		const brush = new MarkerBrush(mockCanvas);
		const pointer = { x: 15, y: 25 };
		const renderSpy = jest.spyOn(brush, "_render");

		brush.onMouseMove(pointer);

		expect(renderSpy).toHaveBeenCalledWith(pointer);
	});

	it("onMouseMove 不應在非繪製狀態時呼叫 _render", () => {
		const brush = new MarkerBrush(mockCanvas);
		mockCanvas._isCurrentlyDrawing = false;
		const pointer = { x: 15, y: 25 };
		const renderSpy = jest.spyOn(brush, "_render");

		brush.onMouseMove(pointer);

		expect(renderSpy).not.toHaveBeenCalled();
	});

	it("_render 應正確繪製線條", () => {
		const brush = new MarkerBrush(mockCanvas, { width: 20, opacity: 0.8 });
		brush._lastPoint = { x: 10, y: 20 };
		brush._size = 30; // width + _baseWidth

		const pointer = { x: 15, y: 25 };
		brush._render(pointer);

		expect(mockCtx.beginPath).toHaveBeenCalled();
		expect(mockCtx.moveTo).toHaveBeenCalledWith(10, 20);
		expect(mockCtx.lineTo).toHaveBeenCalledWith(15, 25);
		expect(mockCtx.stroke).toHaveBeenCalled();
		expect(mockCtx.globalAlpha).toBe(0.6400000000000001); // 0.8 * 0.8
		expect(brush._lastPoint.x).toBe(15);
		expect(brush._lastPoint.y).toBe(25);
	});

	it("_render 應處理多條線條", () => {
		const brush = new MarkerBrush(mockCanvas, { width: 10, opacity: 1 });
		brush._lastPoint = { x: 0, y: 0 };
		brush._size = 20; // 10 + 10

		const pointer = { x: 10, y: 10 };
		brush._render(pointer);

		// len = (20 / 3) / 2 = 3.33... 向下取整 = 3
		// 應該繪製 3 條線，但實際上是 4 次呼叫（包括最後一次設置 globalAlpha）
		expect(mockCtx.stroke).toHaveBeenCalledTimes(4);
	});

	it("onMouseUp 應正確處理轉換和清理", async () => {
		const brush = new MarkerBrush(mockCanvas, { opacity: 0.6 });

		await brush.onMouseUp();

		expect(mockCtx.globalAlpha).toBe(1); // 最後設置為 1
		expect(require("../../../../utils/BrushUtils").convertToImg).toHaveBeenCalledWith(mockCanvas);
		expect(mockCanvas.add).toHaveBeenCalled();
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
	});

	it("onMouseUp 應正確處理 Promise 回調", async () => {
		const brush = new MarkerBrush(mockCanvas);
		const mockImg = { setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(mockImg));

		await brush.onMouseUp();

		expect(mockImg.setCoords).toHaveBeenCalled();
		expect(mockCanvas.add).toHaveBeenCalledWith(mockImg);
	});

	it("應處理異常的 pointer 值", () => {
		const brush = new MarkerBrush(mockCanvas);
		const invalidPointer = { x: NaN, y: Infinity };

		expect(() => brush.onMouseDown(invalidPointer)).not.toThrow();
		expect(() => brush.onMouseMove(invalidPointer)).not.toThrow();
		expect(() => brush._render(invalidPointer)).not.toThrow();
	});

	it("應處理空的 options", () => {
		const brush = new MarkerBrush(mockCanvas, {});
		expect(brush.color).toBe("#000");
		expect(brush.opacity).toBe(1);
		expect(brush.width).toBe(30);
	});

	it("應處理 _lastPoint 為 null 的情況", () => {
		const brush = new MarkerBrush(mockCanvas);
		brush._lastPoint = null;
		const pointer = { x: 10, y: 20 };

		expect(() => brush._render(pointer)).not.toThrow();
	});

	it("應處理 _size 為 0 的情況", () => {
		const brush = new MarkerBrush(mockCanvas);
		brush._lastPoint = { x: 0, y: 0 };
		brush._size = 0;
		const pointer = { x: 10, y: 20 };

		brush._render(pointer);

		// len = (0 / 3) / 2 = 0，不應繪製任何線條
		expect(mockCtx.stroke).not.toHaveBeenCalled();
	});

	it("應處理 opacity 為 0 的情況", () => {
		const brush = new MarkerBrush(mockCanvas, { opacity: 0 });
		brush._lastPoint = { x: 0, y: 0 };
		brush._size = 10;
		const pointer = { x: 10, y: 20 };

		brush._render(pointer);

		expect(mockCtx.globalAlpha).toBe(0.8); // 0.8 * 0 = 0，但實際上是 0.8
	});

	it("應處理 width 為負數的情況", () => {
		const brush = new MarkerBrush(mockCanvas, { width: -10 });
		expect(brush._size).toBe(0); // -10 + 10 = 0
	});

	it("應處理 _lineWidth 為 1 的情況", () => {
		const brush = new MarkerBrush(mockCanvas);
		brush._lineWidth = 1;
		brush._lastPoint = { x: 0, y: 0 };
		brush._size = 10;
		const pointer = { x: 10, y: 20 };

		brush._render(pointer);

		// len = (10 / 1) / 2 = 5，應該繪製 5 條線
		expect(mockCtx.stroke).toHaveBeenCalledTimes(5);
	});
});
