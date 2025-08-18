import SketchyBrush from "../SketchyBrush";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
		colorValues: jest.fn(),
	};
});

describe("SketchyBrush", () => {
	let mockCanvas, mockCtx;

	beforeEach(() => {
		mockCtx = {
			beginPath: jest.fn(),
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
			freeDrawingBrush: { width: 5, color: "#abc" },
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
		require("../../../../utils/BrushUtils").colorValues.mockReturnValue([1, 2, 3]);
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve({ setCoords: jest.fn() }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new SketchyBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(10);
		expect(brush._count).toBe(0);
		expect(brush._points).toEqual([]);
	});

	it("建構時應使用預設值", () => {
		const brush = new SketchyBrush(mockCanvas);
		expect(brush.color).toBe("#abc");
		expect(brush.opacity).toBe(1);
		expect(brush.width).toBe(5);
	});

	it("onMouseDown 應初始化 points 並設置 strokeStyle/lineWidth", () => {
		const brush = new SketchyBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10 });
		const pointer = { x: 1, y: 2 };
		brush.onMouseDown(pointer);
		expect(brush._points).toEqual([pointer]);
		expect(brush._count).toBe(0);
		expect(mockCtx.strokeStyle).toContain("rgba");
		expect(mockCtx.lineWidth).toBe(10);
	});

	it("onMouseMove 應繪製主線與隨機線", () => {
		const brush = new SketchyBrush(mockCanvas, { width: 5 });
		brush._points = [
			{ x: 0, y: 0 },
			{ x: 1, y: 1 },
		];
		brush._count = 0;
		const pointer = { x: 10, y: 10 };
		// 強制 Math.random 回傳 1 以覆蓋 if 內部
		const mathRandom = jest.spyOn(Math, "random").mockReturnValue(1);
		brush.onMouseMove(pointer);
		expect(mockCtx.beginPath).toHaveBeenCalled();
		expect(mockCtx.moveTo).toHaveBeenCalled();
		expect(mockCtx.lineTo).toHaveBeenCalled();
		expect(mockCtx.stroke).toHaveBeenCalled();
		expect(brush._count).toBe(1);
		mathRandom.mockRestore();
	});

	it("onMouseUp 有繪製時應呼叫 convertToImg 並清理", async () => {
		const brush = new SketchyBrush(mockCanvas);
		brush._count = 2;
		brush._points = [{ x: 1, y: 2 }];
		const img = { setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(img));
		await brush.onMouseUp();
		expect(mockCanvas.add).toHaveBeenCalledWith(img);
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
		expect(brush._count).toBe(0);
		expect(brush._points.length).toBe(0);
	});

	it("onMouseUp 無繪製時不呼叫 convertToImg", async () => {
		const brush = new SketchyBrush(mockCanvas);
		brush._count = 0;
		await brush.onMouseUp();
		expect(mockCanvas.add).not.toHaveBeenCalled();
	});

	it("onMouseMove 異常情境: points 長度不足不應 throw", () => {
		const brush = new SketchyBrush(mockCanvas);
		brush._points = [{ x: 0, y: 0 }];
		expect(() => brush.onMouseMove({ x: 1, y: 1 })).not.toThrow();
	});
});
