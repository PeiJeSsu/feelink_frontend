import RibbonBrush from "../RibbonBrush";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
		colorValues: jest.fn(),
	};
});

describe("RibbonBrush", () => {
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
			width: 800,
			height: 600,
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
		require("../../../../utils/BrushUtils").colorValues.mockReturnValue([255, 0, 0]);
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve({ setCoords: jest.fn() }));

		// Mock setInterval 和 clearInterval
		global.setInterval = jest.fn();
		global.clearInterval = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new RibbonBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 5 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(5);
		expect(brush._nrPainters).toBe(50);
		expect(brush._painters).toHaveLength(50);
		expect(brush._lastPoint).toBeNull();
		expect(brush._interval).toBeNull();
	});

	it("建構時應使用預設值", () => {
		const brush = new RibbonBrush(mockCanvas);
		expect(brush.color).toBe("#000");
		expect(brush.opacity).toBe(1);
		expect(brush.width).toBe(1);
	});

	it("_initializePainters 應正確初始化畫家陣列", () => {
		const brush = new RibbonBrush(mockCanvas);
		brush._painters = []; // 清空現有畫家

		brush._initializePainters();

		expect(brush._painters).toHaveLength(50);
		brush._painters.forEach((painter) => {
			expect(painter).toHaveProperty("dx");
			expect(painter).toHaveProperty("dy");
			expect(painter).toHaveProperty("ax");
			expect(painter).toHaveProperty("ay");
			expect(painter).toHaveProperty("div");
			expect(painter).toHaveProperty("ease");
			expect(painter.dx).toBe(400); // canvas.width / 2
			expect(painter.dy).toBe(300); // canvas.height / 2
			expect(painter.ax).toBe(0);
			expect(painter.ay).toBe(0);
			expect(painter.div).toBe(0.1);
			expect(painter.ease).toBeGreaterThanOrEqual(0.6);
			expect(painter.ease).toBeLessThanOrEqual(0.8);
		});
	});

	it("update 應正確更新畫家位置並繪製", () => {
		const brush = new RibbonBrush(mockCanvas);
		const painter = {
			dx: 100,
			dy: 100,
			ax: 0,
			ay: 0,
			div: 0.1,
			ease: 0.7,
		};
		brush._painters = [painter];
		brush._lastPoint = { x: 200, y: 200 };

		brush.update();

		expect(mockCtx.beginPath).toHaveBeenCalled();
		expect(mockCtx.moveTo).toHaveBeenCalledWith(100, 100);
		expect(mockCtx.lineTo).toHaveBeenCalled();
		expect(mockCtx.stroke).toHaveBeenCalled();

		// 檢查畫家位置是否被更新
		expect(painter.dx).not.toBe(100);
		expect(painter.dy).not.toBe(100);
	});

	it("onMouseDown 應正確初始化狀態", () => {
		const brush = new RibbonBrush(mockCanvas, { color: "#ff0000", opacity: 0.8, width: 3 });
		const pointer = { x: 10, y: 20 };
		const initializeSpy = jest.spyOn(brush, "_initializePainters");

		brush.onMouseDown(pointer);

		expect(initializeSpy).toHaveBeenCalled();
		expect(brush._lastPoint).toBe(pointer);
		expect(mockCtx.strokeStyle).toBe("rgba(255,0,0,0.04000000000000001)");
		expect(mockCtx.lineWidth).toBe(3);

		// 檢查所有畫家的初始位置
		brush._painters.forEach((painter) => {
			expect(painter.dx).toBe(10);
			expect(painter.dy).toBe(20);
		});

		expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000 / 60);
	});

	it("onMouseMove 應更新最後點位置", () => {
		const brush = new RibbonBrush(mockCanvas);
		const pointer = { x: 15, y: 25 };

		brush.onMouseMove(pointer);

		expect(brush._lastPoint).toBe(pointer);
	});

	it("onMouseUp 應清理並轉換圖像", async () => {
		const brush = new RibbonBrush(mockCanvas);
		brush._interval = 123; // 模擬 interval ID

		await brush.onMouseUp();

		expect(clearInterval).toHaveBeenCalledWith(123);
		expect(require("../../../../utils/BrushUtils").convertToImg).toHaveBeenCalledWith(mockCanvas);
		expect(mockCanvas.add).toHaveBeenCalled();
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
	});

	it("onMouseUp 應正確處理 Promise 回調", async () => {
		const brush = new RibbonBrush(mockCanvas);
		const mockImg = { setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(mockImg));

		await brush.onMouseUp();

		expect(mockImg.setCoords).toHaveBeenCalled();
		expect(mockCanvas.add).toHaveBeenCalledWith(mockImg);
	});

	it("應處理異常的 pointer 值", () => {
		const brush = new RibbonBrush(mockCanvas);
		const invalidPointer = { x: NaN, y: Infinity };

		expect(() => brush.onMouseDown(invalidPointer)).not.toThrow();
		expect(() => brush.onMouseMove(invalidPointer)).not.toThrow();
	});

	it("應處理空的 options", () => {
		const brush = new RibbonBrush(mockCanvas, {});
		expect(brush.color).toBe("#000");
		expect(brush.opacity).toBe(1);
		expect(brush.width).toBe(1);
	});

	it("應處理 _lastPoint 為 null 的情況", () => {
		const brush = new RibbonBrush(mockCanvas);
		brush._lastPoint = null;
		const painter = {
			dx: 100,
			dy: 100,
			ax: 0,
			ay: 0,
			div: 0.1,
			ease: 0.7,
		};
		brush._painters = [painter];

		expect(() => brush.update()).toThrow("Cannot read properties of null (reading 'x')");
	});

	it("應處理畫家陣列為空的情況", () => {
		const brush = new RibbonBrush(mockCanvas);
		brush._painters = [];
		brush._lastPoint = { x: 100, y: 100 };

		expect(() => brush.update()).not.toThrow();
		expect(mockCtx.stroke).not.toHaveBeenCalled();
	});

	it("應處理 opacity 為 0 的情況", () => {
		const brush = new RibbonBrush(mockCanvas, { opacity: 0 });
		const pointer = { x: 10, y: 20 };

		brush.onMouseDown(pointer);

		expect(mockCtx.strokeStyle).toBe("rgba(255,0,0,0.05)");
	});

	it("應處理 width 為 0 的情況", () => {
		const brush = new RibbonBrush(mockCanvas, { width: 0 });
		const pointer = { x: 10, y: 20 };

		brush.onMouseDown(pointer);

		expect(mockCtx.lineWidth).toBe(1); // 預設值
	});

	it("應處理負數的 width", () => {
		const brush = new RibbonBrush(mockCanvas, { width: -5 });
		const pointer = { x: 10, y: 20 };

		brush.onMouseDown(pointer);

		expect(mockCtx.lineWidth).toBe(-5);
	});

	it("應處理 _interval 為 null 的情況", async () => {
		const brush = new RibbonBrush(mockCanvas);
		brush._interval = null;

		await brush.onMouseUp();

		expect(clearInterval).toHaveBeenCalledWith(null);
	});

	it("應處理畫家的 ease 值邊界", () => {
		const brush = new RibbonBrush(mockCanvas);
		brush._initializePainters();

		// 檢查 ease 值是否在正確範圍內
		brush._painters.forEach((painter) => {
			expect(painter.ease).toBeGreaterThanOrEqual(0.6);
			expect(painter.ease).toBeLessThanOrEqual(0.8);
		});
	});

	it("應處理 update 中的數學計算", () => {
		const brush = new RibbonBrush(mockCanvas);
		const painter = {
			dx: 0,
			dy: 0,
			ax: 0,
			ay: 0,
			div: 0.1,
			ease: 0.7,
		};
		brush._painters = [painter];
		brush._lastPoint = { x: 100, y: 100 };

		brush.update();

		// 檢查數學計算是否正確執行
		expect(painter.ax).not.toBe(0);
		expect(painter.ay).not.toBe(0);
		expect(painter.dx).not.toBe(0);
		expect(painter.dy).not.toBe(0);
	});
});
