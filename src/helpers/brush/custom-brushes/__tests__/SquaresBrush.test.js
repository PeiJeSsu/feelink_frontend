import SquaresBrush from "../SquaresBrush";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
		colorValues: jest.fn(),
	};
});

describe("SquaresBrush", () => {
	let mockCanvas, mockCtx;

	beforeEach(() => {
		mockCtx = {
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			fill: jest.fn(),
			stroke: jest.fn(),
			fillStyle: undefined,
			strokeStyle: undefined,
			lineWidth: null,
			globalAlpha: 1,
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
		global.fabric.FabricImage = { fromURL: jest.fn((url) => Promise.resolve({ set: jest.fn(), setCoords: jest.fn() })) };
		require("../../../../utils/BrushUtils").colorValues.mockImplementation((color) => {
			if (color === "#123") return [10, 20, 30, 0.5];
			if (color === "#fff") return [200, 200, 200, 0.8];
			return [1, 2, 3, 0.5];
		});
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve({ setCoords: jest.fn() }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new SquaresBrush(mockCanvas, { color: "#123", bgColor: "#fff", opacity: 0.5, width: 10 });
		expect(brush.color).toBe("#123");
		expect(brush.bgColor).toBe("#fff");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(10);
		expect(brush._drawn).toBe(false);
		expect(brush._lastPoint).toBeNull();
	});

	it("onMouseDown 應初始化 lastPoint 並設置樣式", () => {
		const brush = new SquaresBrush(mockCanvas, { color: "#123", bgColor: "#fff", opacity: 0.5, width: 10 });
		const pointer = { x: 1, y: 2 };
		brush.onMouseDown(pointer);
		expect(brush._lastPoint).toEqual(pointer);
		expect(brush._drawn).toBe(false);
		expect(mockCanvas.contextTop.globalAlpha).toBe(0.5);
		expect(mockCanvas.contextTop.fillStyle).toBe("rgba(200,200,200,0.8)");
		expect(mockCanvas.contextTop.strokeStyle).toBe("rgba(10,20,30,0.5)");
		expect(mockCanvas.contextTop.lineWidth).toBe(10);
	});

	it("onMouseMove 應繪製方形並更新 lastPoint", () => {
		const brush = new SquaresBrush(mockCanvas);
		brush._lastPoint = { x: 0, y: 0 };
		const pointer = { x: 10, y: 10 };
		brush.onMouseMove(pointer);
		expect(mockCtx.beginPath).toHaveBeenCalled();
		expect(mockCtx.moveTo).toHaveBeenCalled();
		expect(mockCtx.lineTo).toHaveBeenCalled();
		expect(mockCtx.fill).toHaveBeenCalled();
		expect(mockCtx.stroke).toHaveBeenCalled();
		expect(brush._lastPoint).toEqual(pointer);
		expect(brush._drawn).toBe(true);
	});

	it("onMouseUp 有繪製時應呼叫 convertToImg 並清理", async () => {
		const brush = new SquaresBrush(mockCanvas);
		brush._drawn = true;
		const img = { setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(img));
		await brush.onMouseUp();
		expect(mockCanvas.add).toHaveBeenCalledWith(img);
		expect(mockCanvas.clearContext.mock.calls[0][0]).toMatchObject(mockCanvas.contextTop);
		expect(mockCanvas.contextTop.globalAlpha).toBe(1);
	});

	it("onMouseUp 無繪製時不呼叫 convertToImg", async () => {
		const brush = new SquaresBrush(mockCanvas);
		brush._drawn = false;
		await brush.onMouseUp();
		expect(mockCanvas.add).not.toHaveBeenCalled();
		expect(mockCanvas.contextTop.globalAlpha).toBe(1);
	});

	it("onMouseMove 異常情境: lastPoint 為 null 不應 throw 且不繪製", () => {
		const brush = new SquaresBrush(mockCanvas);
		brush._lastPoint = null;
		expect(() => brush.onMouseMove({ x: 1, y: 1 })).not.toThrow();
		expect(mockCtx.beginPath).not.toHaveBeenCalled();
		expect(mockCtx.fill).not.toHaveBeenCalled();
	});

	it("onMouseUp convertToImg 拋出例外時不應 throw", (done) => {
		const brush = new SquaresBrush(mockCanvas);
		brush._drawn = true;
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.reject(new Error("fail")));
		brush.onMouseUp();
		setTimeout(() => {
			expect(mockCanvas.add).not.toHaveBeenCalled();
			expect(mockCanvas.clearContext).not.toHaveBeenCalled();
			done();
		}, 0);
	});
});
