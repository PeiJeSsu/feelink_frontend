import * as fabric from "fabric";

export const setupTextTool = (canvas, settings) => {
  if (!canvas) return;
  
  canvas.isDrawingMode = false;
  canvas.selection = true;
  canvas.defaultCursor = "text";
  
  // 移除現有的事件監聽器
  canvas.off("mouse:down");
  
  canvas.on("mouse:down", function (opt) {
    const target = opt.target;
    
    // 如果點擊到現有的文字框，直接進入編輯模式
    if (target && target.type === "textbox") {
      canvas.setActiveObject(target);
      target.enterEditing();
      canvas.requestRenderAll();
      return;
    }
    
    // 如果點擊到其他物件，不建立新文字框
    if (target) return;
    
    // 點擊空白處，建立新文字框
    const pointer = canvas.getPointer(opt.e);
    const textbox = new fabric.Textbox("請輸入文字", {
      left: pointer.x,
      top: pointer.y,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      fill: settings.fill,
      width: 200,
      editable: true,
      cursorWidth: 1,
      cursorColor: settings.fill,
      selectable: true,
      hasControls: true,
      borderColor: "#5c5c5c",
      cornerColor: "rgba(102,153,255,0.8)",
      cornerSize: 6,
      transparentCorners: false
    });
    
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    textbox.enterEditing();
    canvas.requestRenderAll();
    
    if (canvas.historyManager) {
      setTimeout(() => {
        canvas.historyManager.saveState();
      }, 0);
    }
  });
};

export const updateActiveTextbox = (canvas, settings) => {
  if (!canvas) return;
  
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== "textbox") return;
  
  const wasEditing = activeObject.isEditing;
  if (wasEditing) activeObject.exitEditing();
  
  activeObject.set({
    fontFamily: settings.fontFamily,
    fontSize: settings.fontSize,
    fill: settings.fill,
    cursorColor: settings.fill
  });
  
  if (wasEditing) activeObject.enterEditing();
  canvas.requestRenderAll();
};