import * as PaintBucketTools from "../PaintBucketTools";

describe("PaintBucketTools", () => {
	let canvas;
	let settings;
	beforeEach(() => {
		settings = { color: "#123456", tolerance: 5 };
		canvas = {};
		jest.clearAllMocks();
	});

	describe("setupPaintBucket", () => {
		it("canvas 為 null 時應回傳 null", () => {
			expect(PaintBucketTools.setupPaintBucket(null, settings)).toBeNull();
		});
		it("應呼叫 fill、toggleFloodFill 並回傳控制器", () => {
			jest.spyOn(require("../../../utils/FloodFillUtils"), "fill").mockImplementation(() => {});
			jest.spyOn(require("../../../utils/FloodFillUtils"), "toggleFloodFill").mockImplementation(() => {});
			const ctrl = PaintBucketTools.setupPaintBucket(canvas, settings);
			expect(require("../../../utils/FloodFillUtils").fill).toHaveBeenCalledWith(
				canvas,
				settings.color,
				settings.tolerance
			);
			expect(require("../../../utils/FloodFillUtils").toggleFloodFill).toHaveBeenCalledWith(true);
			expect(ctrl).toHaveProperty("updateColor");
			expect(ctrl).toHaveProperty("updateTolerance");
			expect(ctrl).toHaveProperty("disable");
		});
		it("updateColor 應呼叫 fill", () => {
			jest.spyOn(require("../../../utils/FloodFillUtils"), "fill").mockImplementation(() => {});
			jest.spyOn(require("../../../utils/FloodFillUtils"), "toggleFloodFill").mockImplementation(() => {});
			const ctrl = PaintBucketTools.setupPaintBucket(canvas, settings);
			ctrl.updateColor("#abcdef");
			expect(require("../../../utils/FloodFillUtils").fill).toHaveBeenCalledWith(canvas, "#abcdef", settings.tolerance);
		});
		it("updateTolerance 應呼叫 fill", () => {
			jest.spyOn(require("../../../utils/FloodFillUtils"), "fill").mockImplementation(() => {});
			jest.spyOn(require("../../../utils/FloodFillUtils"), "toggleFloodFill").mockImplementation(() => {});
			const ctrl = PaintBucketTools.setupPaintBucket(canvas, settings);
			ctrl.updateTolerance(10);
			expect(require("../../../utils/FloodFillUtils").fill).toHaveBeenCalledWith(canvas, settings.color, 10);
		});
		it("disable 應呼叫 toggleFloodFill(false)", () => {
			jest.spyOn(require("../../../utils/FloodFillUtils"), "fill").mockImplementation(() => {});
			jest.spyOn(require("../../../utils/FloodFillUtils"), "toggleFloodFill").mockImplementation(() => {});
			const ctrl = PaintBucketTools.setupPaintBucket(canvas, settings);
			ctrl.disable();
			expect(require("../../../utils/FloodFillUtils").toggleFloodFill).toHaveBeenCalledWith(false);
		});
	});

	describe("disablePaintBucket", () => {
		it("canvas 為 null 時應直接 return", () => {
			expect(PaintBucketTools.disablePaintBucket(null)).toBeUndefined();
		});
		it("應呼叫 toggleFloodFill(false)", () => {
			const toggleFloodFill = jest
				.spyOn(require("../../../utils/FloodFillUtils"), "toggleFloodFill")
				.mockImplementation(() => {});
			PaintBucketTools.disablePaintBucket(canvas);
			expect(toggleFloodFill).toHaveBeenCalledWith(false);
		});
	});
});
