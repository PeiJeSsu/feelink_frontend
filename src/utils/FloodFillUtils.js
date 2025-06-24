import { showAlert } from "./AlertUtils";
import { hexToRgb } from "../helpers/color/ColorProcess";

/*
 * FloodFill for fabric.js
 * @author Arjan Haverkamp @av01d
 * @date October 2018
 * @modified by: Shivam Chauhan @shivamc489
 * @date June 2024
 */

// 將填充參數封裝成一個物件
const FillParams = {
	create: (params) => ({
		imageData: params.imageData,
		getPointOffsetFn: params.getPointOffsetFn,
		point: params.point,
		color: params.color,
		target: params.target,
		tolerance: params.tolerance,
		dimensions: {
			width: params.width,
			height: params.height,
		},
	}),
};

// 像素處理參數物件
const PixelParams = {
	create: (params) => ({
		newData: params.newData,
		currentOffset: params.currentOffset,
		color: params.color,
		position: {
			x: params.x,
			y: params.y,
		},
		dimensions: params.dimensions,
		minMax: params.minMax,
	}),
};

export const FloodFill = {
	withinTolerance: function (array1, offset, array2, tolerance) {
		const length = array2.length;
		for (let i = 0; i < length; i++) {
			if (Math.abs(array1[offset + i] - array2[i]) > tolerance) {
				return false;
			}
		}
		return true;
	},

	// 處理單個像素的填充
	processPixel: function (params) {
		const { newData, currentOffset, color, position, minMax } = params;
		const { x, y } = position;

		for (let i = 0; i < 4; i++) {
			newData[currentOffset + i] = color[i];
		}

		minMax.minX = Math.min(minMax.minX, x);
		minMax.minY = Math.min(minMax.minY, y);
		minMax.maxX = Math.max(minMax.maxX, x);
		minMax.maxY = Math.max(minMax.maxY, y);
	},

	// 處理相鄰像素
	processNeighbors: function (x, y, width, height, seen, queue, getPointOffsetFn) {
		const directions = [
			[1, 0],
			[0, 1],
			[0, -1],
			[-1, 0],
		];

		for (const [dx, dy] of directions) {
			const x2 = x + dx;
			const y2 = y + dy;
			const pointKey = `${x2},${y2}`;

			if (x2 >= 0 && y2 >= 0 && x2 < width && y2 < height && !seen.has(pointKey)) {
				queue.push(getPointOffsetFn(x2, y2));
				seen.add(pointKey);
			}
		}
	},

	fill: function (params) {
		const { imageData, getPointOffsetFn, point, color, target, tolerance, dimensions } = FillParams.create(params);
		const { width, height } = dimensions;
		const queue = [];
		const seen = new Set();
		const offset = getPointOffsetFn(point.x, point.y);
		const initialKey = `${point.x},${point.y}`;
		const minMax = {
			minX: width,
			minY: height,
			maxX: 0,
			maxY: 0,
		};

		queue.push(offset);
		seen.add(initialKey);

		const newData = new Uint8ClampedArray(imageData.length);
		newData.set(imageData);

		while (queue.length > 0) {
			const currentOffset = queue.shift();
			const x = (currentOffset / 4) % width;
			const y = Math.floor(currentOffset / (4 * width));

			if (!FloodFill.withinTolerance(newData, currentOffset, target, tolerance)) {
				continue;
			}

			FloodFill.processPixel(
				PixelParams.create({
					newData,
					currentOffset,
					color,
					x,
					y,
					dimensions,
					minMax,
				})
			);
			FloodFill.processNeighbors(x, y, width, height, seen, queue, getPointOffsetFn);
		}

		return {
			minX: minMax.minX,
			minY: minMax.minY,
			maxX: minMax.maxX,
			maxY: minMax.maxY,
			data: newData,
		};
	},
};

let fcanvas;
let fillColor = "#f00";
let fillTolerance = 2;

export function fill(canvas, color, tolerance) {
	fcanvas = canvas;
	fillColor = color;
	fillTolerance = tolerance;
}

// 處理填充目標
function handleFillTarget(target, parsedColor) {
	if (!target) {
		showAlert("請針對封閉區域填充，不可直接填充空白畫布");
		return false;
	}

	const originalFill = target.fill;

	if (originalFill && typeof originalFill === "string" && originalFill.startsWith("#")) {
		const originalRgb = hexToRgb(originalFill);
		if (FloodFill.withinTolerance(originalRgb, 0, parsedColor, fillTolerance)) {
			console.log("忽略... 相同顏色");
			return false;
		}
	}

	target._originalFill = originalFill;
	target.set("fill", fillColor);
	fcanvas.renderAll();

	if (fcanvas.historyManager) {
		setTimeout(() => {
			fcanvas.historyManager.saveState();
		}, 0);
	}

	return true;
}

export function toggleFloodFill(enable) {
	if (!fcanvas) return;

	if (!enable) {
		fcanvas.off("mouse:down");
		fcanvas.selection = true;
		fcanvas.forEachObject(function (object) {
			object.selectable = true;
		});
		return;
	}

	fcanvas.discardActiveObject();
	fcanvas.renderAll();
	fcanvas.selection = false;
	fcanvas.forEachObject(function (object) {
		object.selectable = false;
	});

	fcanvas.on({
		"mouse:down": function (e) {
			const target = fcanvas.findTarget(e.e);
			const parsedColor = hexToRgb(fillColor);
			handleFillTarget(target, parsedColor);
		},
	});
}
