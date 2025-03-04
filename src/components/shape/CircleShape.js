import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

export const handleMouseDownCircle = (
    event,
    canvas,
    settings,
    currentShape
) => {
    const id = uuidv4();
    const pointer = canvas.getPointer(event.e);

    const newCircle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        originX: "center",
        originY: "center",
        radius: 0,
        fill: settings.fill,
        stroke: settings.stroke,
        strokeWidth: settings.strokeWidth,
        opacity: settings.opacity,
        selectable: false,
        hasControls: false,
        id,
    });

    canvas.add(newCircle);
    return newCircle;
};

export const handleMouseMoveCircle = (event, canvas, shape, origin) => {
    if (!shape) return;

    const pointer = canvas.getPointer(event.e);

    const radius =
        Math.sqrt(
            Math.pow(pointer.x - origin.x, 2) +
                Math.pow(pointer.y - origin.y, 2)
        ) / 2;

    shape.set({
        left: (origin.x + pointer.x) / 2,
        top: (origin.y + pointer.y) / 2,
        radius: radius,
    });

    canvas.renderAll();
};

export const isTooSmallCircle = (shape) => {
    return shape.radius < 5;
};
