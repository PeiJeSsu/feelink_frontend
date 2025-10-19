import * as fabric from "fabric";

let _clipboard = null;
let _hasClipboardContent = false;
let _lastPastePosition = { left: 0, top: 0 };
const OFFSET = 10; // 每次貼上的偏移量

export const hasClipboardContent = () => _hasClipboardContent;

export const cut = async (canvas) => {
    if (!canvas?.getActiveObject()) return;

    const activeObject = canvas.getActiveObject();

    _clipboard = await activeObject.clone();
    _hasClipboardContent = true;

    _lastPastePosition = {
        left: activeObject.left,
        top: activeObject.top,
    };

    // 檢查是否為 ActiveSelection 多物件（使用 forEachObject 方法檢查）
    if (activeObject instanceof fabric.ActiveSelection || (activeObject.forEachObject && typeof activeObject.forEachObject === 'function')) {
        // 多物件剪下需要逐一刪除所有物件
        const objectsToRemove = [];
        activeObject.forEachObject((obj) => {
            objectsToRemove.push(obj);
        });

        // 先取消選取，再逐一刪除物件
        canvas.discardActiveObject();
        objectsToRemove.forEach((obj) => {
            canvas.remove(obj);
        });
    } else {
        // 單一物件直接刪除
        canvas.remove(activeObject);
    }

    canvas.requestRenderAll();

    // 儲存到歷史記錄
    if (canvas.historyManager) {
        canvas.historyManager.saveState();
    }
};

export const copy = async (canvas) => {
    if (!canvas?.getActiveObject()) {
        _hasClipboardContent = false;
        return;
    }

    const activeObject = canvas.getActiveObject();

    _clipboard = await activeObject.clone();
    _hasClipboardContent = true;

    _lastPastePosition = {
        left: activeObject.left,
        top: activeObject.top,
    };
};

export const paste = async (canvas) => {
    if (!canvas || !_clipboard) return;

    try {
        const clonedObj = await _clipboard.clone();

        // 如果原始物件是 ActiveSelection，確保 clone 後的物件保持正確的原型
        if (_clipboard instanceof fabric.ActiveSelection || (_clipboard.forEachObject && typeof _clipboard.forEachObject === 'function')) {
            Object.setPrototypeOf(clonedObj, fabric.ActiveSelection.prototype);
        }

        canvas.discardActiveObject();

        const newPosition = {
            left: _lastPastePosition.left + OFFSET,
            top: _lastPastePosition.top + OFFSET,
        };

        clonedObj.set({
            left: newPosition.left,
            top: newPosition.top,
            evented: true,
        });

        _lastPastePosition = newPosition;

        // 檢查是否為 ActiveSelection 多物件
        if (clonedObj instanceof fabric.ActiveSelection) {
            clonedObj.canvas = canvas;
            const objects = [];

            // 將 ActiveSelection 中的每個子物件加入畫布
            clonedObj.forEachObject((obj) => {
                canvas.add(obj);
                objects.push(obj);
            });
            clonedObj.setCoords();

            // 重新建立 ActiveSelection 並設為選取物件
            const sel = new fabric.ActiveSelection(objects, { canvas });
            canvas.setActiveObject(sel);
        } else {
            // 單一物件直接加入畫布並設為選取物件
            canvas.add(clonedObj);
            canvas.setActiveObject(clonedObj);
        }
        canvas.requestRenderAll();

        // 儲存到歷史記錄
        if (canvas.historyManager) {
            canvas.historyManager.saveState();
        }
    } catch (error) {
        console.error("貼上失敗:", error);
    }
};
