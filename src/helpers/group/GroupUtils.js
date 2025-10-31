import * as fabric from "fabric";

/**
 * 將多個選取物件群組化
 * @param {fabric.Canvas} canvas - 畫布實例
 */
export function groupSelectedObjects(canvas) {
	if (!canvas.getActiveObject()) {
		return;
	}

	if (!(canvas.getActiveObject() instanceof fabric.ActiveSelection)) {
		return;
	}
	
	const wasBatchOperation = canvas.isBatchOperation;
	canvas.isBatchOperation = true;
	
	// 從 ActiveSelection 取得物件並移除
	const activeSelection = canvas.getActiveObject();
	const selectedObjects = activeSelection.removeAll();
	
	// 從畫布移除原始物件(防止重複)
	selectedObjects.forEach(obj => {
		canvas.remove(obj);
	});
	
	// 創建群組並添加到畫布
	const group = new fabric.Group(selectedObjects);
	canvas.add(group);
	canvas.setActiveObject(group);
	
	canvas.isBatchOperation = wasBatchOperation;
	canvas.requestRenderAll();
	
	if (canvas.historyManager) {
		canvas.historyManager.saveState();
	}
}

/**
 * 解散目前選取的群組
 * @param {fabric.Canvas} canvas - 畫布實例
 */
export function ungroupSelectedGroup(canvas) {
	const group = canvas.getActiveObject();
	if (!group || !(group instanceof fabric.Group)) {
		return;
	}
	
	const wasBatchOperation = canvas.isBatchOperation;
	canvas.isBatchOperation = true;
	
	// 移除群組(必須在 removeAll 之前)
	canvas.remove(group);
	
	// 從群組取出物件並創建 ActiveSelection
	// 物件會自動回到畫布,不需手動 canvas.add()
	const sel = new fabric.ActiveSelection(group.removeAll(), {
		canvas: canvas,
	});
	canvas.setActiveObject(sel);
	
	canvas.isBatchOperation = wasBatchOperation;
	canvas.requestRenderAll();
	
	if (canvas.historyManager) {
		canvas.historyManager.saveState();
	}
}
