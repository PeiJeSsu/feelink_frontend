import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

export const handleMouseDownEllipse = (event, canvas, settings) => {
	const id = uuidv4();
	const pointer = canvas.getPointer(event.e);

	const newEllipse = new fabric.Ellipse({
		left: pointer.x,
		top: pointer.y,
		originX: "center",
		originY: "center",
		rx: 0,
		ry: 0,
		fill: settings.fill,
		stroke: settings.stroke,
		strokeWidth: settings.strokeWidth,
		opacity: settings.opacity,
		selectable: false,
		hasControls: false,
		id,
	});

	canvas.add(newEllipse);
	return newEllipse;
};

export const handleMouseMoveEllipse = (event, canvas, shape, origin) => {
	if (!shape) return;

	const pointer = canvas.getPointer(event.e);

	const rx = Math.abs(pointer.x - origin.x) / 2;
	const ry = Math.abs(pointer.y - origin.y) / 2;

	shape.set({
		left: (origin.x + pointer.x) / 2,
		top: (origin.y + pointer.y) / 2,
		rx: rx,
		ry: ry,
	});

	canvas.renderAll();
};

export const isTooSmallEllipse = (shape) => {
	return shape.rx < 5 || shape.ry < 5;
};
