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

/**
 * 獲取顏色的詳細資訊
 * @param {string} hexColor - 十六進位顏色值 (#RRGGBB)
 * @returns {Object} 包含顏色資訊的物件
 */
export const getColorInfo = (hexColor) => {
	const r = parseInt(hexColor.slice(1, 3), 16);
	const g = parseInt(hexColor.slice(3, 5), 16);
	const b = parseInt(hexColor.slice(5, 7), 16);
	const rgb = `rgb(${r}, ${g}, ${b})`;

	return {
		hex: hexColor,
		rgb,
	};
};

/**
 * 將十六進制顏色碼轉換為 RGB 陣列
 * @param {string} hex - 十六進制顏色碼（例如：#FF0000）
 * @param {number} opacity - 透明度（0-1）
 * @returns {number[]} RGB 陣列，包含透明度
 */
export function hexToRgb(hex, opacity) {
	opacity = Math.round(opacity * 255) || 255;
	hex = hex.replace("#", "");
	if (hex.length === 6) {
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		return [r, g, b, opacity];
	}
	// fallback: 支援 3 位元 hex
	if (hex.length === 3) {
		const r = parseInt(hex[0] + hex[0], 16);
		const g = parseInt(hex[1] + hex[1], 16);
		const b = parseInt(hex[2] + hex[2], 16);
		return [r, g, b, opacity];
	}
	return [0, 0, 0, opacity];
}
