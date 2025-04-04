let _clipboard = null;
let _hasClipboardContent = false;
let _lastPastePosition = { left: 0, top: 0 };
const OFFSET = 10; // 每次貼上的偏移量

export const hasClipboardContent = () => _hasClipboardContent;

export const cut = async (canvas) => {
    if (!canvas?.getActiveObject()) return;
    
    const activeObject = canvas.getActiveObject();
    // 複製選中的物件
    _clipboard = await activeObject.clone();
    _hasClipboardContent = true;
    // 設定最後貼上位置為當前物件位置
    _lastPastePosition = {
        left: activeObject.left,
        top: activeObject.top
    };
    // 刪除原始物件
    canvas.remove(activeObject);
    canvas.requestRenderAll();
};

export const copy = async (canvas) => {
    if (!canvas?.getActiveObject()) return;
    
    const activeObject = canvas.getActiveObject();
    // 複製選中的物件
    _clipboard = await activeObject.clone();
    _hasClipboardContent = true;
    // 設定最後貼上位置為當前物件位置
    _lastPastePosition = {
        left: activeObject.left,
        top: activeObject.top
    };
};

export const paste = async (canvas) => {
    if (!canvas || !_clipboard) return;
    
    try {
        // 複製剪貼簿中的物件
        const clonedObj = await _clipboard.clone();
        
        // 取消當前選中的物件
        canvas.discardActiveObject();
        
        // 計算新的位置（從最後貼上的位置偏移）
        const newPosition = {
            left: _lastPastePosition.left + OFFSET,
            top: _lastPastePosition.top + OFFSET
        };
        
        // 設定新物件的位置
        clonedObj.set({
            left: newPosition.left,
            top: newPosition.top,
            evented: true,
        });
        
        // 更新最後貼上位置
        _lastPastePosition = newPosition;
        
        // 添加到畫布
        canvas.add(clonedObj);
        
        // 選中新貼上的物件
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
    } catch (error) {
        console.error('貼上失敗:', error);
    }
}; 