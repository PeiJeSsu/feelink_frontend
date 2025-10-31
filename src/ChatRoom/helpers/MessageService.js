import {
    sendMessage,
    callAIDrawingAPI,
    callAIDrawingAPIStream,
    sendMessageStream,
    analysisImage,
    sendImageToBackendStream,
    sendCanvasAnalysisToBackendStream,
    loadChatroomMessages,
    loadChatroomTextMessages,
    loadChatroomDrawingMessages,
    loadUserMessages,
    loadAIMessages,
    getTodayEmotionAnalysis,
    getTodayChatSummary,
    getTodayDemandAnalysis,
    getTodaySentimentScore,
    savePreQuestionForChatroom,
    analyzeAndSaveToday,
    getTodayAnalysis,
    saveCanvasToBackend,
    getLatestAnalysisForChatrooms
} from "./MessageAPI";
import {serializeCanvas} from "../../helpers/file/CanvasSerialization";

// 獲取選中的個性設置
const getSelectedPersonality = () => {
    return localStorage.getItem('selectedPersonality') || 'default';
};

// 添加 chatroomId 和 personality 參數
export const sendTextToBackend = async (payload, chatroomId) => {
    return handleServiceCall(() => sendMessage(payload.text, payload.conversationCount, payload.hasDefaultQuestion, chatroomId, getSelectedPersonality()));
};

// 添加 chatroomId 和 personality 參數
export const sendImageToBackend = async (messageText, messageImage, chatroomId) => {
    return handleServiceCall(() => analysisImage(messageText, messageImage, chatroomId, getSelectedPersonality()));
};

// 添加 chatroomId 和 personality 參數
export const sendCanvasAnalysisToBackend = async (messageText, canvasImage, chatroomId) => {
    const defaultMessage = "請分析這張圖片";
    return handleServiceCall(() => analysisImage(messageText || defaultMessage, canvasImage, chatroomId, getSelectedPersonality()));
};

// AI 繪圖函數，增加 chatroomId 參數和去背邏輯
export const sendAIDrawingToBackend = async (messageText, canvasData, chatroomId, mode = 'drawing') => {
    const defaultMessage = "請根據這張圖片生成新的內容";

    // 添加 chatroomId 參數到 API 調用
    return handleServiceCall(() => callAIDrawingAPI(messageText || defaultMessage, canvasData, true, chatroomId, mode));
};

// AI 繪圖串流函數
export const sendAIDrawingToBackendStream = async (messageText, canvasData, chatroomId, onToken, onComplete, onError, onImageGenerated) => {
    const defaultMessage = "請根據這張圖片生成新的內容";
    return callAIDrawingAPIStream(messageText || defaultMessage, canvasData, true, chatroomId, onToken, onComplete, onError, onImageGenerated);
};

// 更新流式發送函數，使用 chatroomId
export const sendTextToBackendStream = async (payload, chatroomId, onToken, onComplete, onError) => {
    return sendMessageStream(payload.text, chatroomId, onToken, onComplete, onError);
};

// 更新流式發送函數，使用 chatroomId
export const sendImageToBackendStreamService = async (messageText, messageImage, chatroomId, onToken, onComplete, onError) => {
    return sendImageToBackendStream(messageText, messageImage, chatroomId, onToken, onComplete, onError);
};

// 畫布分析流式服務，使用 chatroomId
export const sendCanvasAnalysisToBackendStreamService = async (messageText, canvasImage, chatroomId, onToken, onComplete, onError) => {
    return sendCanvasAnalysisToBackendStream(messageText, canvasImage, chatroomId, onToken, onComplete, onError);
};

// 載入聊天室歷史訊息的服務
export const loadChatroomHistoryService = async (chatroomId) => {
    return handleServiceCall(() => loadChatroomMessages(chatroomId));
};

// 載入文字訊息服務
export const loadTextMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadChatroomTextMessages(chatroomId));
};

// 載入畫布資料服務
export const loadDrawingMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadChatroomDrawingMessages(chatroomId));
};

// 載入使用者訊息服務
export const loadUserMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadUserMessages(chatroomId));
};

// 載入AI訊息服務
export const loadAIMessagesService = async (chatroomId) => {
    return handleServiceCall(() => loadAIMessages(chatroomId));
};

// 情緒分析報告 
export const loadEmotionAnalysisService = async (chatroomId) => {
    return handleServiceCall(() => getTodayEmotionAnalysis(chatroomId));
};
// 摘要報告
export const loadSummaryService = async (chatroomId) => {
    return handleServiceCall(() => getTodayChatSummary(chatroomId));
};

// 需求報告
export const loadDemandAnalysisService = async (chatroomId) => {
    return handleServiceCall(() => getTodayDemandAnalysis(chatroomId));
};
// 情緒分數
export const loadSentimentScoreService = async (chatroomId) => {
    return handleServiceCall(() => getTodaySentimentScore(chatroomId));
};

export const loadAnalyzeAndSaveToday = async (chatroomId) => {
    try {
        const result = await analyzeAndSaveToday(chatroomId);
        return result;
    } catch (error) {
        throw error;
    }
};

export const loadGetTodayAnalysis = async (chatroomId) => {
    try {
        const result = await getTodayAnalysis(chatroomId);
        return result;
    } catch (error) {
        throw error;
    }
};

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
export const savePreQuestionService = async (chatroomId, preQuestion) => {
    return handleServiceCall(() => savePreQuestionForChatroom(chatroomId, preQuestion));
};

export const saveCanvasToBackendAPI = async (canvas, chatroomId) => {
    if (!canvas) {
        throw new Error('畫布未初始化');
    }

    if (!chatroomId) {
        throw new Error('聊天室 ID 不能為空');
    }

    try {
        const canvasData = serializeCanvas(canvas);

        if (!canvasData) {
            throw new Error('畫布 Serialize 失敗');
        }

        // 生成畫布縮圖
        let canvasImageUrl = null;
        try {
            const { generateCanvasPreview } = await import('../../helpers/image/ImageExport');
            const preview = await generateCanvasPreview(canvas, 'png', false);
            canvasImageUrl = preview.dataURL;
        } catch (previewError) {
            console.warn('生成畫布縮圖失敗:', previewError);
            // 縮圖生成失敗不影響畫布儲存
        }

        return await saveCanvasToBackend(canvasData, chatroomId, canvasImageUrl);
    } catch (error) {
        console.error('儲存畫布到後端失敗:', error);
        throw error;
    }
};

// 獲取多個聊天室的最新情緒分析摘要
export const loadLatestAnalysisForChatroomsService = async (chatroomIds) => {
    try {
        const result = await getLatestAnalysisForChatrooms(chatroomIds);
        return result;
    } catch (error) {
        throw error;
    }
};