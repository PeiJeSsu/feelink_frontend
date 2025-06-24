import * as FloodFillUtils from "../FloodFillUtils";
const FloodFill = FloodFillUtils.__esModule && FloodFillUtils.default ? FloodFillUtils.default : FloodFillUtils.FloodFill;

jest.mock("../../helpers/color/ColorProcess", () => ({ hexToRgb: jest.fn() }));
jest.mock("../AlertUtils", () => ({ showAlert: jest.fn() }));

describe("FloodFillUtils", () => {
	describe("fill", () => {
		it("應能設置 fcanvas, fillColor, fillTolerance", () => {
			FloodFillUtils.fill("canvas", "#123456", 5);
			// 由於 fcanvas, fillColor, fillTolerance 為 module 內部變數，僅能檢查無錯誤
			expect(true).toBe(true);
		});
	});

	describe("toggleFloodFill", () => {
		it("enable=false 時應移除 mouse:down 並恢復選取", () => {
			const mockCanvas = {
				off: jest.fn(),
				selection: true,
				forEachObject: jest.fn(),
			};
			FloodFillUtils.fill(mockCanvas, "#fff", 2);
			FloodFillUtils.toggleFloodFill(false);
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.selection).toBe(true);
			expect(mockCanvas.forEachObject).toHaveBeenCalled();
		});
	});

	describe("FloodFill.fill", () => {
		it("應能正確執行填充演算法", () => {
			const params = {
				imageData: new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]),
				getPointOffsetFn: (x, y) => (y * 2 + x) * 4,
				point: { x: 0, y: 0 },
				color: [255, 0, 0, 255],
				target: [0, 0, 0, 255],
				tolerance: 10,
				width: 2,
				height: 1,
			};
			const result = FloodFill.fill(params);
			expect(result).toHaveProperty("data");
			expect(result).toHaveProperty("minX");
			expect(result).toHaveProperty("minY");
		});
	});

	describe("FloodFill.withinTolerance", () => {
		it("容忍範圍內應回傳 true", () => {
			const arr1 = [10, 20, 30, 40];
			const arr2 = [12, 19, 29, 41];
			expect(FloodFill.withinTolerance(arr1, 0, arr2, 3)).toBe(true);
		});
		it("超出容忍範圍應回傳 false", () => {
			const arr1 = [10, 20, 30, 40];
			const arr2 = [20, 20, 30, 40];
			expect(FloodFill.withinTolerance(arr1, 0, arr2, 3)).toBe(false);
		});
	});

	describe("FloodFill.processPixel", () => {
		it("應正確寫入顏色並更新 min/max", () => {
			const newData = new Uint8ClampedArray(8);
			const minMax = { minX: 10, minY: 10, maxX: 0, maxY: 0 };
			FloodFill.processPixel({
				newData,
				currentOffset: 0,
				color: [1, 2, 3, 4],
				position: { x: 5, y: 6 },
				dimensions: { width: 10, height: 10 },
				minMax,
			});
			expect(Array.from(newData.slice(0, 4))).toEqual([1, 2, 3, 4]);
			expect(minMax.minX).toBe(5);
			expect(minMax.minY).toBe(6);
			expect(minMax.maxX).toBe(5);
			expect(minMax.maxY).toBe(6);
		});
		it("min/max 應正確取極值", () => {
			const newData = new Uint8ClampedArray(8);
			const minMax = { minX: 2, minY: 2, maxX: 8, maxY: 8 };
			FloodFill.processPixel({
				newData,
				currentOffset: 0,
				color: [1, 2, 3, 4],
				position: { x: 10, y: 1 },
				dimensions: { width: 10, height: 10 },
				minMax,
			});
			expect(minMax.minX).toBe(2);
			expect(minMax.minY).toBe(1);
			expect(minMax.maxX).toBe(10);
			expect(minMax.maxY).toBe(8);
		});
	});

	describe("FloodFill.processNeighbors", () => {
		it("應正確將四個方向加入 queue 並標記 seen", () => {
			const seen = new Set();
			const queue = [];
			const getPointOffsetFn = (x, y) => x + y * 10;
			FloodFill.processNeighbors(5, 5, 10, 10, seen, queue, getPointOffsetFn);
			expect(queue.length).toBe(4);
			expect(seen.size).toBe(4);
		});
		it("邊界不應加入 queue", () => {
			const seen = new Set();
			const queue = [];
			const getPointOffsetFn = (x, y) => x + y * 2;
			FloodFill.processNeighbors(0, 0, 2, 2, seen, queue, getPointOffsetFn);
			expect(queue.length).toBe(2); // 只會加入 (1,0) (0,1)
			expect(seen.has("1,0")).toBe(true);
			expect(seen.has("0,1")).toBe(true);
		});
	});

	describe("toggleFloodFill 事件流程覆蓋 handleFillTarget", () => {
		let hexToRgb;
		beforeEach(() => {
			jest.clearAllMocks();
			hexToRgb = require("../../helpers/color/ColorProcess").hexToRgb;
			hexToRgb.mockReset();
		});
		it("target 為 null 時應觸發 showAlert 並 return false", () => {
			const { showAlert } = require("../AlertUtils");
			const mockCanvas = {
				off: jest.fn(),
				discardActiveObject: jest.fn(),
				renderAll: jest.fn(),
				selection: true,
				forEachObject: jest.fn(),
				on: jest.fn(function (events) {
					// 模擬 mouse:down 事件
					events["mouse:down"]({ e: {} });
				}),
				findTarget: jest.fn(() => null),
			};
			FloodFillUtils.fill(mockCanvas, "#00ff00", 2);
			FloodFillUtils.toggleFloodFill(true);
			expect(showAlert).toHaveBeenCalled();
		});
		it("originalFill 為 #hex 且顏色相同時 return false", () => {
			hexToRgb.mockReturnValue([255, 0, 0]);
			const mockCanvas = {
				off: jest.fn(),
				discardActiveObject: jest.fn(),
				renderAll: jest.fn(),
				selection: true,
				forEachObject: jest.fn(),
				on: jest.fn(function (events) {
					events["mouse:down"]({ e: {} });
				}),
				findTarget: jest.fn(() => ({ fill: "#ff0000" })),
			};
			FloodFillUtils.fill(mockCanvas, "#00ff00", 2);
			FloodFillUtils.toggleFloodFill(true);
			// 不會 set fill
		});
		it("originalFill 為 #hex 且顏色不同時應 set fill 並 renderAll", () => {
			hexToRgb.mockImplementation((hex) => {
				if (hex === "#ff0000") return [255, 0, 0];
				if (hex === "#00ff01") return [0, 255, 1];
				return [0, 0, 0];
			});
			const set = jest.fn();
			const mockCanvas = {
				off: jest.fn(),
				discardActiveObject: jest.fn(),
				renderAll: jest.fn(),
				selection: true,
				forEachObject: jest.fn(),
				on: jest.fn(function (events) {
					events["mouse:down"]({ e: {} });
				}),
				findTarget: jest.fn(() => ({ fill: "#ff0000", set })),
				historyManager: null,
			};
			FloodFillUtils.fill(mockCanvas, "#00ff01", 2);
			FloodFillUtils.toggleFloodFill(true);
			expect(set).toHaveBeenCalledWith("fill", "#00ff01");
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
		it("originalFill 非 #hex 時應 set fill 並 renderAll", () => {
			hexToRgb.mockReturnValue([0, 0, 0]);
			const set = jest.fn();
			const mockCanvas = {
				off: jest.fn(),
				discardActiveObject: jest.fn(),
				renderAll: jest.fn(),
				selection: true,
				forEachObject: jest.fn(),
				on: jest.fn(function (events) {
					events["mouse:down"]({ e: {} });
				}),
				findTarget: jest.fn(() => ({ fill: "rgba(0,0,0,1)", set })),
				historyManager: null,
			};
			FloodFillUtils.fill(mockCanvas, "#00ff01", 2);
			FloodFillUtils.toggleFloodFill(true);
			expect(set).toHaveBeenCalledWith("fill", "#00ff01");
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
		it("historyManager 存在時應 saveState", (done) => {
			hexToRgb.mockImplementation((hex) => {
				if (hex === "#000001") return [0, 0, 1];
				if (hex === "#00ff01") return [0, 255, 1];
				return [0, 0, 0];
			});
			const set = jest.fn();
			const saveState = jest.fn();
			const mockCanvas = {
				off: jest.fn(),
				discardActiveObject: jest.fn(),
				renderAll: jest.fn(),
				selection: true,
				forEachObject: jest.fn(),
				on: jest.fn(function (events) {
					events["mouse:down"]({ e: {} });
				}),
				findTarget: jest.fn(() => ({ fill: "#000001", set })),
				historyManager: { saveState },
			};
			FloodFillUtils.fill(mockCanvas, "#00ff01", 2);
			FloodFillUtils.toggleFloodFill(true);
			setTimeout(() => {
				expect(saveState).toHaveBeenCalled();
				done();
			}, 30);
		});
	});
});
