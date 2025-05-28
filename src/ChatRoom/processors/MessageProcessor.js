import { PROMPT_TEMPLATES } from "../constants/PromptTemplates";

// 根據對話次數選擇適當的訊息模板  
export const getFullMessage = (messageText, conversationCount, defaultQuestion) => {
    if (conversationCount === 3) {
        return PROMPT_TEMPLATES.DRAWING_SUGGESTION(messageText);
    } else if (defaultQuestion) {
        return PROMPT_TEMPLATES.CONTINUE_CONVERSATION(messageText);
    } else {
        return PROMPT_TEMPLATES.SIMPLE_RESPONSE(messageText);
    }
};

// 處理 AI 繪圖結果
export const processDrawingResult = (result, currentId, messages, setMessages, canvas) => {
    const { clearCanvas, addImageToCanvas } = require("../../helpers/canvas/CanvasOperations");
    
    // 如果有文字回應，顯示出來
    if (result.message) {
        const { createNewMessage } = require("../utils/MessageUtils");
        const textResponseMessage = createNewMessage(currentId, result.message, false, false);
        setMessages(prevMessages => [...prevMessages, textResponseMessage]);
        currentId++;
    }

    // 處理生成的圖片
    if (result.imageData && canvas) {
        clearCanvas(canvas);
        addImageToCanvas(canvas, `data:image/png;base64,${result.imageData}`);
    }

    return currentId;
};