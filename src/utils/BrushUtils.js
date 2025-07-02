import * as fabric from "fabric";

function parseHexColor(color) {
	if (color.length < 7) {
		color =
			"#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : "");
	}
	return [
		parseInt(color.slice(1, 3), 16),
		parseInt(color.slice(3, 5), 16),
		parseInt(color.slice(5, 7), 16),
		color.length > 7 ? parseInt(color.slice(7, 9), 16) / 255 : 1,
	];
}

function parseRgbColor(color) {
	if (!color.includes("rgba")) color += ",1";
	return color.match(/[\d.]+/g).map(Number);
}

function parseNamedColor(color) {
	const tempElem = document.createElement("fictum");
	document.body.appendChild(tempElem);
	try {
		const flag = "rgb(1, 2, 3)";
		tempElem.style.color = flag;
		if (tempElem.style.color !== flag) return undefined;
		tempElem.style.color = color;
		if (tempElem.style.color === flag || tempElem.style.color === "") return undefined;
		return getComputedStyle(tempElem).color;
	} finally {
		document.body.removeChild(tempElem);
	}
}

export function colorValues(color) {
	if (!color) return undefined;
	if (color.toLowerCase() === "transparent") return [0, 0, 0, 0];
	if (color[0] === "#") return parseHexColor(color);
	if (!color.includes("rgb")) {
		color = parseNamedColor(color);
		if (!color) return undefined;
	}
	if (color?.startsWith("rgb")) return parseRgbColor(color);
	return undefined;
}

export function convertToImg(canvas) {
	const pixelRatio = canvas.getRetinaScaling();
	const upperCanvas = canvas.upperCanvasEl;
	const c = document.createElement("canvas");
	const ctx = c.getContext("2d");

	c.width = upperCanvas.width;
	c.height = upperCanvas.height;
	ctx.drawImage(upperCanvas, 0, 0);

	const xy = trimCanvas(c);

	return fabric.FabricImage.fromURL(c.toDataURL()).then((img) => {
		img.set({
			left: xy.x / pixelRatio,
			top: xy.y / pixelRatio,
			scaleX: 1 / pixelRatio,
			scaleY: 1 / pixelRatio,
		});
		return img;
	});
}

export function trimCanvas(canvas) {
	const ctx = canvas.getContext("2d");
	const w = canvas.width;
	const h = canvas.height;
	const pix = { x: [], y: [] };
	const imageData = ctx.getImageData(0, 0, w, h);
	const fn = (a, b) => a - b;

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (imageData.data[(y * w + x) * 4 + 3] > 0) {
				pix.x.push(x);
				pix.y.push(y);
			}
		}
	}

	pix.x.sort(fn);
	pix.y.sort(fn);
	const n = pix.x.length - 1;

	if (n === -1) {
		return { x: 0, y: 0 };
	}

	const newW = pix.x[n] - pix.x[0];
	const newH = pix.y[n] - pix.y[0];
	const cut = ctx.getImageData(pix.x[0], pix.y[0], newW, newH);

	canvas.width = newW;
	canvas.height = newH;
	ctx.putImageData(cut, 0, 0);

	return { x: pix.x[0], y: pix.y[0] };
}

export function getRandom(max = 1, min = 0) {
	return Math.random() * (max - min) + min;
}

export function clamp(n, max, min = 0) {
	if (n > max) return max;
	if (n < min) return min;
	return n;
}

/**
 * 計算兩點間的角度
 * @param {fabric.Point} point1 第一個點
 * @param {fabric.Point} point2 第二個點
 * @returns {number} 兩點之間的角度,單位是弧度
 */
export function angleBetween(point1, point2) {
	return Math.atan2(point1.x - point2.x, point1.y - point2.y);
}

/**
 * 標準化向量並應用厚度
 * @param {fabric.Point} point 要標準化的點
 * @param {number} [thickness=1] 向量的厚度
 * @returns {fabric.Point} 標準化後的點
 */
export function normalize(point, thickness) {
	if (thickness === null || thickness === undefined) {
		thickness = 1;
	}

	const length = point.distanceFrom({ x: 0, y: 0 });

	if (length > 0) {
		point.x = (point.x / length) * thickness;
		point.y = (point.y / length) * thickness;
	}

	return point;
}

const BrushUtils = {
	colorValues,
	convertToImg,
	getRandom,
	clamp,
	angleBetween,
	normalize,
};

export default BrushUtils;
