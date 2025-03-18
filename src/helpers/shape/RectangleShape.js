import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

export const handleMouseDownRect = (event, canvas, settings) => {
    const id = uuidv4();
    const pointer = canvas.getPointer(event.e);

    const newRect = new fabric.Rect({
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

    canvas.add(newRect);
    return newRect;
};

export const handleMouseMoveRect = (event, canvas, shape, origin) => {
    if (!shape) return;

    const pointer = canvas.getPointer(event.e);

    shape.set({
        width: Math.abs(origin.x - pointer.x),
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

export const isTooSmallRect = (shape) => {
    return shape.width < 5 || shape.height < 5;
};
