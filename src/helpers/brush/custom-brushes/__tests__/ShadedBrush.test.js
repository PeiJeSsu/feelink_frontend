import ShadedBrush from "../ShadedBrush";

jest.mock("../../../../utils/BrushUtils", () => {
	const original = jest.requireActual("../../../../utils/BrushUtils");
	return {
		...original,
		convertToImg: jest.fn(),
		colorValues: jest.fn(),
	};
});

describe("ShadedBrush", () => {
	let mockCanvas, mockCtx;

	beforeEach(() => {
		mockCtx = {
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			stroke: jest.fn(),
			strokeStyle: null,
			lineWidth: null,
			lineJoin: null,
			lineCap: null,
		};
		mockCanvas = {
			contextTop: mockCtx,
			add: jest.fn(),
			clearContext: jest.fn(),
			freeDrawingBrush: { width: 5 },
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
		require("../../../../utils/BrushUtils").colorValues.mockReturnValue([255, 0, 0]);
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve({ setCoords: jest.fn() }));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("建構時應正確設置屬性", () => {
		const brush = new ShadedBrush(mockCanvas, { color: "#123", opacity: 0.5, width: 10, shadeDistance: 2000 });
		expect(brush.color).toBe("#123");
		expect(brush.opacity).toBe(0.5);
		expect(brush.width).toBe(10);
		expect(brush.shadeDistance).toBe(2000);
		expect(brush._points).toEqual([]);
	});

	it("建構時應使用預設值", () => {
		const brush = new ShadedBrush(mockCanvas);
		expect(brush.color).toBe("#000");
		expect(brush.opacity).toBe(0.3);
		expect(brush.width).toBe(5); // 來自 canvas.freeDrawingBrush.width
		expect(brush.shadeDistance).toBe(1000);
	});

	it("onMouseDown 應正確初始化狀態", () => {
		const brush = new ShadedBrush(mockCanvas, { color: "#ff0000", opacity: 0.8, width: 3 });
		const pointer = { x: 10, y: 20 };

		brush.onMouseDown(pointer);

		expect(brush._points).toEqual([pointer]);
		expect(mockCtx.strokeStyle).toBe("rgba(255,0,0,0.8)");
		expect(mockCtx.lineWidth).toBe(3);
		expect(mockCtx.lineJoin).toBe("round");
		expect(mockCtx.lineCap).toBe("round");
	});

	it("onMouseMove 應添加點並繪製主要線條", () => {
		const brush = new ShadedBrush(mockCanvas);
		const pointer1 = { x: 10, y: 20 };
		const pointer2 = { x: 15, y: 25 };

		// 先執行 onMouseDown
		brush.onMouseDown(pointer1);

		brush.onMouseMove(pointer2);

		expect(brush._points).toEqual([pointer1, pointer2]);
		expect(mockCtx.beginPath).toHaveBeenCalled();
		expect(mockCtx.moveTo).toHaveBeenCalledWith(10, 20);
		expect(mockCtx.lineTo).toHaveBeenCalledWith(15, 25);
		expect(mockCtx.stroke).toHaveBeenCalled();
	});

	it("onMouseMove 應繪製陰影效果", () => {
		const brush = new ShadedBrush(mockCanvas, { shadeDistance: 500 });
		const pointer1 = { x: 0, y: 0 };
		const pointer2 = { x: 10, y: 10 };

		brush.onMouseDown(pointer1);
		brush.onMouseMove(pointer2);

		// 檢查是否繪製了陰影線條
		// 由於只有兩個點，陰影效果應該被觸發
		expect(mockCtx.stroke).toHaveBeenCalledTimes(3); // 主要線條 + 2次陰影線條
	});

	it("onMouseMove 應處理多個點", () => {
		const brush = new ShadedBrush(mockCanvas);
		const pointers = [
			{ x: 0, y: 0 },
			{ x: 10, y: 10 },
			{ x: 20, y: 20 },
		];

		brush.onMouseDown(pointers[0]);
		brush.onMouseMove(pointers[1]);
		brush.onMouseMove(pointers[2]);

		expect(brush._points).toEqual(pointers);
		// 應該有多次繪製呼叫
		expect(mockCtx.stroke).toHaveBeenCalledTimes(7); // 2次主要線條 + 5次陰影效果
	});

	it("onMouseMove 應處理距離超過 shadeDistance 的情況", () => {
		const brush = new ShadedBrush(mockCanvas, { shadeDistance: 50 });
		const pointer1 = { x: 0, y: 0 };
		const pointer2 = { x: 100, y: 100 }; // 距離超過 50

		brush.onMouseDown(pointer1);
		brush.onMouseMove(pointer2);

		// 由於距離超過 shadeDistance，不應繪製陰影
		expect(mockCtx.stroke).toHaveBeenCalledTimes(2); // 主要線條 + 1次陰影（距離檢查）
	});

	it("onMouseUp 有繪製時應呼叫 convertToImg", async () => {
		const brush = new ShadedBrush(mockCanvas);
		brush._points = [
			{ x: 0, y: 0 },
			{ x: 10, y: 10 },
		]; // 多於一個點

		await brush.onMouseUp();

		expect(require("../../../../utils/BrushUtils").convertToImg).toHaveBeenCalledWith(mockCanvas);
		expect(mockCanvas.add).toHaveBeenCalled();
		expect(mockCanvas.clearContext).toHaveBeenCalledWith(mockCtx);
		expect(brush._points).toEqual([]);
	});

	it("onMouseUp 無繪製時不呼叫 convertToImg", async () => {
		const brush = new ShadedBrush(mockCanvas);
		brush._points = [{ x: 0, y: 0 }]; // 只有一個點

		await brush.onMouseUp();

		expect(require("../../../../utils/BrushUtils").convertToImg).not.toHaveBeenCalled();
		expect(mockCanvas.add).not.toHaveBeenCalled();
		expect(brush._points).toEqual([]);
	});

	it("onMouseUp 應正確處理 Promise 回調", async () => {
		const brush = new ShadedBrush(mockCanvas);
		brush._points = [
			{ x: 0, y: 0 },
			{ x: 10, y: 10 },
		];
		const mockImg = { setCoords: jest.fn() };
		require("../../../../utils/BrushUtils").convertToImg.mockImplementation(() => Promise.resolve(mockImg));

		await brush.onMouseUp();

		expect(mockImg.setCoords).toHaveBeenCalled();
		expect(mockCanvas.add).toHaveBeenCalledWith(mockImg);
	});

	it("應處理異常的 pointer 值", () => {
		const brush = new ShadedBrush(mockCanvas);
		const invalidPointer = { x: NaN, y: Infinity };

		expect(() => brush.onMouseDown(invalidPointer)).not.toThrow();
		expect(() => brush.onMouseMove(invalidPointer)).not.toThrow();
	});

	it("應處理空的 options", () => {
		const brush = new ShadedBrush(mockCanvas, {});
		expect(brush.color).toBe("#000");
		expect(brush.opacity).toBe(0.3);
		expect(brush.width).toBe(5);
		expect(brush.shadeDistance).toBe(1000);
	});

	it("應處理 null canvas.freeDrawingBrush", () => {
		const canvasWithoutBrush = {
			...mockCanvas,
			freeDrawingBrush: null,
		};
		const brush = new ShadedBrush(canvasWithoutBrush);
		expect(brush.width).toBe(1); // 預設值
	});

	it("應處理 opacity 為 0 的情況", () => {
		const brush = new ShadedBrush(mockCanvas, { opacity: 0 });
		const pointer = { x: 10, y: 20 };

		brush.onMouseDown(pointer);

		expect(mockCtx.strokeStyle).toBe("rgba(255,0,0,0.3)"); // 預設 opacity
	});

	it("應處理 shadeDistance 為 0 的情況", () => {
		const brush = new ShadedBrush(mockCanvas, { shadeDistance: 0 });
		const pointer1 = { x: 0, y: 0 };
		const pointer2 = { x: 1, y: 1 };

		brush.onMouseDown(pointer1);
		brush.onMouseMove(pointer2);

		// 由於 shadeDistance 為 0，不應繪製陰影
		expect(mockCtx.stroke).toHaveBeenCalledTimes(3); // 主要線條 + 2次陰影（距離檢查）
	});

	it("應處理負數的 shadeDistance", () => {
		const brush = new ShadedBrush(mockCanvas, { shadeDistance: -100 });
		const pointer1 = { x: 0, y: 0 };
		const pointer2 = { x: 1, y: 1 };

		brush.onMouseDown(pointer1);
		brush.onMouseMove(pointer2);

		// 由於 shadeDistance 為負數，不應繪製陰影
		expect(mockCtx.stroke).toHaveBeenCalledTimes(1); // 只有主要線條
	});

	it("應處理 _points 陣列為空的情況", () => {
		const brush = new ShadedBrush(mockCanvas);
		brush._points = [];
		const pointer = { x: 10, y: 20 };

		expect(() => brush.onMouseMove(pointer)).toThrow("Cannot read properties of undefined (reading 'x')");
	});

	it("應處理只有一個點的情況", () => {
		const brush = new ShadedBrush(mockCanvas);
		const pointer = { x: 10, y: 20 };

		brush.onMouseDown(pointer);
		brush.onMouseMove(pointer); // 移動到相同位置

		// 由於距離為 0，應該繪製
		expect(mockCtx.stroke).toHaveBeenCalled();
	});

	it("應處理陰影效果的數學計算", () => {
		const brush = new ShadedBrush(mockCanvas, { shadeDistance: 1000 });
		const pointer1 = { x: 0, y: 0 };
		const pointer2 = { x: 10, y: 10 };

		brush.onMouseDown(pointer1);
		brush.onMouseMove(pointer2);

		// 檢查陰影線條的座標計算
		// 陰影線條應該從 (currentPoint.x + dx * 0.2, currentPoint.y + dy * 0.2)
		// 到 (point.x - dx * 0.2, point.y - dy * 0.2)
		expect(mockCtx.moveTo).toHaveBeenCalledWith(10 + (0 - 10) * 0.2, 10 + (0 - 10) * 0.2);
		expect(mockCtx.lineTo).toHaveBeenCalledWith(0 - (0 - 10) * 0.2, 0 - (0 - 10) * 0.2);
	});

	it("應處理多個陰影線條", () => {
		const brush = new ShadedBrush(mockCanvas, { shadeDistance: 1000 });
		const pointer1 = { x: 0, y: 0 };
		const pointer2 = { x: 10, y: 10 };
		const pointer3 = { x: 20, y: 20 };

		brush.onMouseDown(pointer1);
		brush.onMouseMove(pointer2);
		brush.onMouseMove(pointer3);

		// 應該有多次繪製呼叫：2次主要線條 + 多次陰影線條
		expect(mockCtx.stroke).toHaveBeenCalledTimes(7); // 2次主要線條 + 5次陰影效果
	});
});
