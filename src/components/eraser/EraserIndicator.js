import * as fabric from "fabric";

export const createEraserIndicator = (
	canvas,
	pointer,
	size,
	fillColor = "rgba(255, 0, 0, 0.3)",
	strokeColor = "red"
) => {
	const indicator = new fabric.Circle({
		left: pointer.x,
		top: pointer.y,
		radius: size / 2,
		fill: fillColor,
		stroke: strokeColor,
		strokeWidth: 1,
		originX: "center",
		originY: "center",
		selectable: false,
		evented: false,
	});

	canvas.add(indicator);
	canvas.renderAll();

	return indicator;
};

export const updateIndicatorPosition = (canvas, indicator, pointer) => {
	if (!indicator) return;

	indicator.set({
		left: pointer.x,
		top: pointer.y,
	});

	canvas.renderAll();
};

export const removeIndicator = (canvas, indicator) => {
	if (!indicator) return;

	canvas.remove(indicator);
	canvas.renderAll();
};

export const setupIndicatorEventListeners = (canvas, indicatorRef, createIndicator) => {
	// 設置 mouse:move 事件監聽器
	canvas.on("mouse:move", (opt) => {
		if (!indicatorRef.current) return;

		const pointer = canvas.getPointer(opt.e);
		updateIndicatorPosition(canvas, indicatorRef.current, pointer);
	});

	// 設置 mouse:out 事件監聽器
	canvas.on("mouse:out", () => {
		if (indicatorRef.current) {
			removeIndicator(canvas, indicatorRef.current);
			indicatorRef.current = null;
		}
	});

	// 設置 mouse:over 事件監聽器
	canvas.on("mouse:over", (opt) => {
		const pointer = canvas.getPointer(opt.e);
		indicatorRef.current = createIndicator(pointer);
	});

	return {
		removeListeners: () => {
			canvas.off("mouse:move");
			canvas.off("mouse:over");
			canvas.off("mouse:out");
		},
	};
};

