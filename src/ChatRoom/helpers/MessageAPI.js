import {apiConfig} from "../config/ApiConfig";
import $ from 'jquery';

const createSSEStream = (url, formData, onToken, onComplete, onError) => {
    let buffer = '';
    let lastProcessedLength = 0;
    $.ajax({
        url: url,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
        },
        xhr: function() {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 3 || xhr.readyState === 4) {
                    if (xhr.status !== 200) {
                        onError(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        return;
                    }
                    const responseText = xhr.responseText;
                    if (responseText.length > lastProcessedLength) {
                        const newData = responseText.substring(lastProcessedLength);
                        lastProcessedLength = responseText.length;
                        buffer += newData;
                        console.log('Buffer content:', JSON.stringify(buffer));
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (line.startsWith('data:')) {
                                const data = line.substring(line.indexOf(':') + 1).replace(/^[ ]*/, '');
                                if (data.trim()) {
                                    console.log('Token received:', data);
                                    onToken(data);
                                }
                            }
                        }
                    }
                    if (xhr.readyState === 4) {
                        console.log('SSE stream completed');
                        onComplete();
                    }
                }
            };
            return xhr;
        }
    });
};

// 修改：使用 chatroomId 替代 sessionId
export const sendMessageStream = (text, chatroomId, onToken, onComplete, onError) => {
    const formData = new FormData();
    formData.append('userMessage', text);
    formData.append('chatroomId', chatroomId);

    createSSEStream(`${apiConfig.defaults.baseURL}/chat`, formData, onToken, onComplete, onError);
};

// 修改：使用 chatroomId 替代 sessionId
export const sendImageToBackendStream = async (messageText, messageImage, chatroomId, onToken, onComplete, onError) => {
    const formData = new FormData();
    formData.append('userMessage', messageText);
    formData.append('file', messageImage);
    formData.append('chatroomId', chatroomId);

    createSSEStream(`${apiConfig.defaults.baseURL}/analysis`, formData, onToken, onComplete, onError);
};

// 修改：使用 chatroomId 替代 sessionId
export const sendCanvasAnalysisToBackendStream = async (messageText, canvasImage, chatroomId, onToken, onComplete, onError) => {
    const formData = new FormData();
    formData.append('userMessage', messageText || '請分析這張圖片');
    formData.append('file', canvasImage);
    formData.append('chatroomId', chatroomId);

    createSSEStream(`${apiConfig.defaults.baseURL}/analysis`, formData, onToken, onComplete, onError);
};

// 修改：使用 chatroomId 替代 sessionId，並添加對話計數參數
export const sendMessage = (text, conversationCount, hasDefaultQuestion, chatroomId) => {
    const formData = new FormData();
    formData.append('userMessage', text);
    formData.append('chatroomId', chatroomId);
    
    if (conversationCount !== null) {
        formData.append('conversationCount', conversationCount);
        formData.append('hasDefaultQuestion', hasDefaultQuestion);
    }

    return apiConfig.post(`/chat`, formData)
    .then(response => ({
        content: response.data.content
    }));
};

// AI 繪圖 API（保持不變，因為這個可能是不同的服務）
export const callAIDrawingAPI = (messageText, canvasData, removeBackground = true) => {
    const requestData = {
        text: messageText,
        imageData: canvasData,
        removeBackground: removeBackground
    };

    return apiConfig.post(`/generate`, requestData, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.data || !response.data.success) {
            throw new Error(response?.data?.error || 'AI 畫圖失敗');
        }
        return response.data.content;
    });
};

// 修改：使用 chatroomId 替代 sessionId
export const analysisImage = (text, file, chatroomId) => {
    const formData = new FormData();
    formData.append('userMessage', text);
    formData.append('chatroomId', chatroomId);
    
    if (file) {
        formData.append('file', file);
    }

    return apiConfig.post(`/analysis`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
    .then(response => {
        return response.data.content;
    })
    .catch(error => {
        throw new Error(error.response?.data?.message || error.message || '圖片分析失敗');
    });
};

// 🎯 新增：載入聊天室的歷史訊息
export const loadChatroomMessages = async (chatroomId) => {
    try {
        console.log('正在載入聊天室訊息:', chatroomId);
        const response = await apiConfig.get(`/api/messages/chatroom/${chatroomId}`);
        return response.data;
    } catch (error) {
        console.error('載入聊天室訊息失敗:', error);
        throw new Error(error.response?.data?.message || error.message || '載入聊天記錄失敗');
    }
};

// 🎯 新增：只載入文字訊息（非畫布資料）
export const loadChatroomTextMessages = async (chatroomId) => {
    try {
        const response = await apiConfig.get(`/api/messages/chatroom/${chatroomId}/text`);
        return response.data;
    } catch (error) {
        console.error('載入文字訊息失敗:', error);
        throw new Error(error.response?.data?.message || error.message || '載入文字記錄失敗');
    }
};

// 🎯 新增：載入畫布資料
export const loadChatroomDrawingMessages = async (chatroomId) => {
    try {
        const response = await apiConfig.get(`/api/messages/chatroom/${chatroomId}/drawing`);
        return response.data;
    } catch (error) {
        console.error('載入畫布訊息失敗:', error);
        throw new Error(error.response?.data?.message || error.message || '載入畫布記錄失敗');
    }
};

// 🎯 新增：載入使用者訊息
export const loadUserMessages = async (chatroomId) => {
    try {
        const response = await apiConfig.get(`/api/messages/chatroom/${chatroomId}/user`);
        return response.data;
    } catch (error) {
        console.error('載入使用者訊息失敗:', error);
        throw new Error(error.response?.data?.message || error.message || '載入使用者記錄失敗');
    }
};

// 🎯 新增：載入AI訊息
export const loadAIMessages = async (chatroomId) => {
    try {
        const response = await apiConfig.get(`/api/messages/chatroom/${chatroomId}/ai`);
        return response.data;
    } catch (error) {
        console.error('載入AI訊息失敗:', error);
        throw new Error(error.response?.data?.message || error.message || '載入AI記錄失敗');
    }
};