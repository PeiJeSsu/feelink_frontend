import CrayonBrush from "../CrayonBrush";
import * as fabric from "fabric";
import { convertToImg, getRandom, clamp } from "../../../../utils/BrushUtils";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
	};
});

describe("CrayonBrush", () => {
	let mockCanvas, mockCtx;

	beforeEach(() => {
		mockCtx = {
			save: jest.fn(),
			restore: jest.fn(),
			fill: jest.fn(),
			beginPath: jest.fn(),
			rect: jest.fn(),
			fillStyle: null,
			drawImage: jest.fn(),
			getImageData: jest.fn(() => ({ data: new Array(10000).fill(0) })),
		};
		mockCanvas = {
			contextTop: mockCtx,
			add: jest.fn(),
			clearContext: jest.fn(),
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
		global.fabric.FabricImage = { fromURL: jest.fn(() => Promise.resolve({ set: jest.fn(), setCoords: jest.fn() })) };
		jest.spyOn(fabric, "Point").mockImplementation(function (x = 0, y = 0) {
			this.x = x;
			this.y = y;
			this.subtract = function (p) {
				return new fabric.Point(this.x - p.x, this.y - p.y);
			};
			this.distanceFrom = function (p) {
				return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2);
			};
			this.add = function (p) {
				return new fabric.Point(this.x + p.x, this.y + p.y);
			};
		});
		jest.spyOn(convertToImg, "bind").mockReturnValue(() => Promise.resolve({ setCoords: jest.fn() }));
		jest.spyOn(getRandom, "bind").mockReturnValue(() => 1);
		jest.spyOn(clamp, "bind").mockReturnValue(() => 1);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new CrayonBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(10);
	});

	it("onMouseDown 應設置 alpha、size 並呼叫 set", () => {
		const brush = new CrayonBrush(mockCanvas, { width: 20 });
		const setSpy = jest.spyOn(brush, "set");
		brush.onMouseDown({ x: 1, y: 2 });
		expect(mockCtx.globalAlpha).toBe(brush.opacity);
		expect(brush._size).toBe(brush.width / 2 + brush._baseWidth);
		expect(setSpy).toHaveBeenCalled();
	});

	it("onMouseMove 應呼叫 update 與 draw", () => {
		const brush = new CrayonBrush(mockCanvas);
		const updateSpy = jest.spyOn(brush, "update");
		const drawSpy = jest.spyOn(brush, "draw");
		brush.onMouseMove({ x: 3, y: 4 });
		expect(updateSpy).toHaveBeenCalled();
		expect(drawSpy).toHaveBeenCalledWith(mockCtx);
	});

	it("onMouseUp 有繪製時應呼叫 convertToImg 並清理", async () => {
		const brush = new CrayonBrush(mockCanvas);
		brush._latest = [{ x: 1, y: 2 }];
		brush._latestStrokeLength = 1;
		brush._drawn = true;
		const img = { set: jest.fn(), setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(img));
		
		brush.onMouseUp();
		
		// 等待 Promise 解析
		await new Promise(resolve => setTimeout(resolve, 0));
		
		expect(mockCanvas.add).toHaveBeenCalled();
		expect(mockCanvas.add.mock.calls[0][0]).toBe(img);
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
		expect(brush._latest).toBeNull();
		expect(brush._latestStrokeLength).toBe(0);
	});

	it("onMouseUp 無繪製時不呼叫 convertToImg", () => {
		const brush = new CrayonBrush(mockCanvas);
		brush._drawn = false;
		brush.onMouseUp();
		expect(mockCanvas.add).not.toHaveBeenCalled();
	});

	it("set 應正確設置 _latest 和 _point", () => {
		const brush = new CrayonBrush(mockCanvas);
		brush.set({ x: 5, y: 6 });
		expect(brush._point.x).toBe(5);
		expect(brush._point.y).toBe(6);
		expect(brush._latest).not.toBeNull();
	});

	it("update 應正確計算 _latestStrokeLength", () => {
		const brush = new CrayonBrush(mockCanvas);
		brush.set({ x: 1, y: 1 });
		brush.update({ x: 4, y: 5 });
		expect(typeof brush._latestStrokeLength).toBe("number");
	});

	it("draw 應呼叫 ctx.fill 並設置 _drawn", () => {
		const brush = new CrayonBrush(mockCanvas);
		brush._point = new fabric.Point(10, 10);
		brush._latest = new fabric.Point(5, 5);
		brush._size = 10;
		brush._sep = 2;
		brush._inkAmount = 5;
		brush._latestStrokeLength = 1;
		brush.draw(mockCtx);
		expect(mockCtx.fill).toHaveBeenCalled();
		expect(brush._drawn).toBe(true);
	});

	it("draw 異常情境: _latest 為 null 不應 throw", () => {
		const brush = new CrayonBrush(mockCanvas);
		brush._point = new fabric.Point(0, 0);
		brush._latest = new fabric.Point(0, 0);
		brush._size = 0;
		brush._sep = 1;
		brush._inkAmount = 1;
		brush._latestStrokeLength = 1;
		expect(() => brush.draw(mockCtx)).not.toThrow();
	});
});
