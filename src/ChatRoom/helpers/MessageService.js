import { sendMessage , callAIDrawingAPI, analysisImage } from "./MessageAPI";

// 檢查用戶角色的函數
const getUserRole = () => {
    return localStorage.getItem('role') || sessionStorage.getItem('role') || null;
};

// 顯示去背確認對話框的函數
const showBackgroundRemovalDialog = () => {
    return new Promise((resolve) => {
        const result = window.confirm('是否要為生成的圖片去除背景？');
        resolve(result);
    });
};

// 發送文字訊息到後端
export const sendTextToBackend = async (payload) => {
    return handleServiceCall(() => sendMessage(payload.text, payload.conversationCount, payload.hasDefaultQuestion));
};

// 發送圖片訊息到後端
export const sendImageToBackend = async (messageText, messageImage) => {
    return handleServiceCall(() => analysisImage(messageText, messageImage));
};

// 發送畫布分析到後端
export const sendCanvasAnalysisToBackend = async (messageText, canvasImage) => {
    const defaultMessage = "請分析這張圖片";
    return handleServiceCall(() => analysisImage(messageText || defaultMessage, canvasImage));
};

// 修改後的 AI 繪圖函數，增加去背邏輯
export const sendAIDrawingToBackend = async (messageText, canvasData) => {
    const defaultMessage = "請根據這張圖片生成新的內容";
    const userRole = getUserRole();
    let removeBackground = false; 

    try {
        if (userRole === 'tester') {
            removeBackground = await showBackgroundRemovalDialog();
        } else {
            removeBackground = true;
        }

        return handleServiceCall(() => 
            callAIDrawingAPI(messageText || defaultMessage, canvasData, removeBackground)
        );
    } catch (error) {
        return handleServiceCall(() => 
            callAIDrawingAPI(messageText || defaultMessage, canvasData, false)
        );
    }
};

// 通用的錯誤處理和回應格式化函數
const handleServiceCall = async (serviceCall) => {
    try {
        const response = await serviceCall();
        return {
            success: true,
            content: response.content || response
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};
