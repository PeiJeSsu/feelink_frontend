import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

export const handleMouseDownTriangle = (
    event,
    canvas,
    settings,
    currentShape
) => {
    const id = uuidv4();
    const pointer = canvas.getPointer(event.e);

    const newTriangle = new fabric.Triangle({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: settings.fill,
        stroke: settings.stroke,
        strokeWidth: settings.strokeWidth,
        opacity: settings.opacity,
        selectable: false,
        hasControls: false,
        id,
    });

    canvas.add(newTriangle);
    return newTriangle;
};

export const handleMouseMoveTriangle = (event, canvas, shape, origin) => {
    if (!shape) return;

    const pointer = canvas.getPointer(event.e);

    shape.set({
        width: Math.abs(origin.x - pointer.x) * 2,
        height: Math.abs(origin.y - pointer.y),
    });

    if (origin.x > pointer.x) {
        shape.set({ left: pointer.x });
    }

    if (origin.y > pointer.y) {
        shape.set({ top: pointer.y });
    }

    canvas.renderAll();
};

export const isTooSmallTriangle = (shape) => {
    return shape.width < 5 || shape.height < 5;
};
