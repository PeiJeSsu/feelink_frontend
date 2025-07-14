import * as fabric from "fabric";

/**
 * 將多個選取物件群組化
 * @param {fabric.Canvas} canvas - 畫布實例
 */
export function groupSelectedObjects(canvas) {
	if (!canvas.getActiveObject()) {
		return;
	}

	if (canvas.getActiveObject().type !== "activeSelection" && canvas.getActiveObject().type !== "activeselection") {
		return;
	}
	const group = new fabric.Group(canvas.getActiveObject().removeAll());
	canvas.add(group);
	canvas.setActiveObject(group);
	canvas.requestRenderAll();
}

/**
 * 解散目前選取的群組
 * @param {fabric.Canvas} canvas - 畫布實例
 */
export function ungroupSelectedGroup(canvas) {
	const group = canvas.getActiveObject();
	if (!group || group.type !== "group") {
		return;
	}
	canvas.remove(group);
	const sel = new fabric.ActiveSelection(group.removeAll(), {
		canvas: canvas,
	});
	canvas.setActiveObject(sel);
	canvas.requestRenderAll();
}
