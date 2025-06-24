import { convertToRGBA } from "../ColorProcess";

describe("ColorConvert 測試", () => {
	// 測試處理 null/undefined 顏色值
	test("當顏色值為 null 或 undefined 時應返回黑色 RGBA", () => {
		expect(convertToRGBA(null, 0.5)).toBe("rgba(0, 0, 0, 0.5)");
		expect(convertToRGBA(undefined, 0.7)).toBe("rgba(0, 0, 0, 0.7)");
		expect(convertToRGBA("", 0.2)).toBe("rgba(0, 0, 0, 0.2)");
	});

	// 測試已經是 RGBA 格式的情況
	test("當顏色已經是 RGBA 格式時應直接返回", () => {
		const rgbaColor = "rgba(255, 0, 0, 0.5)";
		expect(convertToRGBA(rgbaColor, 0.7)).toBe(rgbaColor);
	});

	// 測試十六進制轉換
	test("應將十六進制顏色轉換為 RGBA 格式", () => {
		// 紅色
		expect(convertToRGBA("#FF0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
		// 綠色
		expect(convertToRGBA("#00FF00", 0.7)).toBe("rgba(0, 255, 0, 0.7)");
		// 藍色
		expect(convertToRGBA("#0000FF", 0.9)).toBe("rgba(0, 0, 255, 0.9)");
		// 黑色
		expect(convertToRGBA("#000000", 1)).toBe("rgba(0, 0, 0, 1)");
		// 白色
		expect(convertToRGBA("#FFFFFF", 0.3)).toBe("rgba(255, 255, 255, 0.3)");
	});

	// 測試 RGB 轉換
	test("應將 RGB 顏色轉換為 RGBA 格式", () => {
		// 標準 RGB 格式
		expect(convertToRGBA("rgb(255, 0, 0)", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
		expect(convertToRGBA("rgb(0, 255, 0)", 0.7)).toBe("rgba(0, 255, 0, 0.7)");
		expect(convertToRGBA("rgb(0, 0, 255)", 0.9)).toBe("rgba(0, 0, 255, 0.9)");

		// 不同空格格式
		expect(convertToRGBA("rgb(255,0,0)", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
		expect(convertToRGBA("rgb( 255 , 0 , 0 )", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
	});

	// 測試無效的 RGB 字符串
	test("應處理無效的 RGB 字符串", () => {
		// 缺少值的 RGB
		const invalidRgb = "rgb(255, 0)";
		expect(convertToRGBA(invalidRgb, 0.5)).toBe(invalidRgb);

		// 格式錯誤的 RGB
		const malformedRgb = "rgb(255, 0, abc)";
		expect(convertToRGBA(malformedRgb, 0.5)).toBe(malformedRgb);
	});

	// 測試不支持的格式
	test("應直接返回不支持的顏色格式", () => {
		const namedColor = "red";
		expect(convertToRGBA(namedColor, 0.5)).toBe(namedColor);

		const hslColor = "hsl(0, 100%, 50%)";
		expect(convertToRGBA(hslColor, 0.5)).toBe(hslColor);
	});
});
