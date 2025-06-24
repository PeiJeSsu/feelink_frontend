import * as ColorProcess from "../ColorProcess";

describe("ColorProcess", () => {
	describe("convertToRGBA", () => {
		it("hex 轉 rgba", () => {
			expect(ColorProcess.convertToRGBA("#FF0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
		});
		it("rgb 轉 rgba", () => {
			expect(ColorProcess.convertToRGBA("rgb(10,20,30)", 0.7)).toBe("rgba(10, 20, 30, 0.7)");
		});
		it("rgba 直接回傳", () => {
			expect(ColorProcess.convertToRGBA("rgba(1,2,3,0.4)", 0.8)).toBe("rgba(1,2,3,0.4)");
		});
		it("空字串回傳黑色", () => {
			expect(ColorProcess.convertToRGBA("", 0.3)).toBe("rgba(0, 0, 0, 0.3)");
		});
		it("不支援格式直接回傳", () => {
			expect(ColorProcess.convertToRGBA("blue", 0.2)).toBe("blue");
		});
	});

	describe("getColorInfo", () => {
		it("hex 轉 rgb 字串", () => {
			expect(ColorProcess.getColorInfo("#00FF00")).toEqual({ hex: "#00FF00", rgb: "rgb(0, 255, 0)" });
		});
	});

	describe("hexToRgb", () => {
		it("hex 轉 rgb 陣列", () => {
			expect(ColorProcess.hexToRgb("#0000FF", 1)).toEqual([0, 0, 255, 255]);
		});
		it("hex 轉 rgb 陣列（透明度 0.5）", () => {
			expect(ColorProcess.hexToRgb("#123456", 0.5)).toEqual([18, 52, 86, 128]);
		});
	});
});
