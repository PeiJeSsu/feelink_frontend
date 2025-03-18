/**
 * 將十六進制或 RGB 顏色轉換為 RGBA 格式
 * @param {string} color - 顏色值 (#RRGGBB 或 rgb(r,g,b))
 * @param {number} opacity - 透明度 (0-1)
 * @returns {string} - rgba(r,g,b,a) 格式的顏色字符串
 */
export const convertToRGBA = (color, opacity) => {
	if (!color) return `rgba(0, 0, 0, ${opacity})`;

	if (color.startsWith("rgba")) return color;

	if (color.startsWith("#")) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}

	if (color.startsWith("rgb")) {
		const rgbValues = color.match(/\d+/g);
		if (rgbValues && rgbValues.length >= 3) {
			return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
		}
	}

	return color;
};
