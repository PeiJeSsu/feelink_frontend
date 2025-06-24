import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

export const handleMouseDownLine = (event, canvas, settings) => {
	const id = uuidv4();
	const pointer = canvas.getPointer(event.e);

	const newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
		stroke: settings.stroke,
		strokeWidth: settings.strokeWidth,
		opacity: settings.opacity,
		selectable: false,
		hasControls: false,
		id,
	});

	canvas.add(newLine);
	return newLine;
};

export const handleMouseMoveLine = (event, canvas, shape) => {
	if (!shape) return;

	const pointer = canvas.getPointer(event.e);

	shape.set({
		x2: pointer.x,
		y2: pointer.y,
	});

	canvas.renderAll();
};

export const isTooSmallLine = (shape) => {
	const dx = shape.x2 - shape.x1;
	const dy = shape.y2 - shape.y1;
	const length = Math.sqrt(dx * dx + dy * dy);
	return length < 5;
};
