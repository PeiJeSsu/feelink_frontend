import FurBrush from "../FurBrush";
import * as fabric from "fabric";
import { convertToImg } from "../../../../utils/BrushUtils";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
		colorValues: jest.fn(),
	};
});

describe("FurBrush", () => {
	let mockCanvas, mockCtx;

	beforeEach(() => {
		mockCtx = {
			strokeStyle: null,
			lineWidth: null,
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			stroke: jest.fn(),
			drawImage: jest.fn(),
			getImageData: jest.fn(() => ({ data: new Array(10000).fill(0) })),
		};
		mockCanvas = {
			contextTop: mockCtx,
			add: jest.fn(),
			clearContext: jest.fn(),
			freeDrawingBrush: { width: 2 },
			getRetinaScaling: jest.fn(() => 1),
			upperCanvasEl: { width: 100, height: 100 },
		};
		jest.spyOn(fabric, "BaseBrush").mockImplementation(function () {});
		require("../../../../utils/BrushUtils").colorValues.mockImplementation(() => [1, 2, 3]);
		jest.spyOn(convertToImg, "bind").mockReturnValue(() => Promise.resolve({ setCoords: jest.fn() }));
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
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new FurBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(10);
	});

	it("onMouseDown 應初始化 points 並設置 strokeStyle/lineWidth", () => {
		const brush = new FurBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		const pointer = { x: 1, y: 2 };
		brush.onMouseDown(pointer);
		expect(brush._points.length).toBe(2);
		expect(mockCtx.strokeStyle).toContain("rgba");
		expect(mockCtx.lineWidth).toBe(10);
	});

	it("onMouseMove 應繪製主線與毛線", () => {
		const brush = new FurBrush(mockCanvas, { width: 5 });
		brush._points = [{ x: 0, y: 0 }];
		const pointer = { x: 10, y: 10 };
		brush.onMouseMove(pointer);
		expect(mockCtx.beginPath).toHaveBeenCalled();
		expect(mockCtx.moveTo).toHaveBeenCalled();
		expect(mockCtx.lineTo).toHaveBeenCalled();
		expect(mockCtx.stroke).toHaveBeenCalled();
		expect(brush._count).toBe(1);
	});

	it("onMouseUp 有繪製時應呼叫 convertToImg 並清理", async () => {
		const brush = new FurBrush(mockCanvas);
		brush._count = 2;
		brush._points = [{ x: 1, y: 2 }];
		const img = { set: jest.fn(), setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(img));
		
		brush.onMouseUp();
		
		// 等待 Promise 解析
		await new Promise(resolve => setTimeout(resolve, 0));
		
		expect(mockCanvas.add).toHaveBeenCalled();
		expect(mockCanvas.add.mock.calls[0][0]).toBe(img);
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
		expect(brush._count).toBe(0);
		expect(brush._points.length).toBe(0);
	});

	it("onMouseUp 無繪製時不呼叫 convertToImg", () => {
		const brush = new FurBrush(mockCanvas);
		brush._count = 0;
		brush.onMouseUp();
		expect(mockCanvas.add).not.toHaveBeenCalled();
	});

	it("onMouseMove 異常情境: points 長度不足不應 throw", () => {
		const brush = new FurBrush(mockCanvas);
		brush._points = [{ x: 0, y: 0 }];
		expect(() => brush.onMouseMove({ x: 1, y: 1 })).not.toThrow();
	});
});
