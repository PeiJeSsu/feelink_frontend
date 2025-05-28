import {apiConfig} from "../config/ApiConfig";

const generateSessionId = () => crypto.randomUUID();

// 儲存使用中的會話ID
let currentSessionId = localStorage.getItem('chatSessionId') || generateSessionId();

// 儲存會話ID到localStorage
const saveSessionId = () => {
  localStorage.setItem('chatSessionId', currentSessionId);
};

// 初始化時保存會話ID
saveSessionId();

export const sendMessage = (text, image, sessionId = currentSessionId) => {
  const formData = new FormData();
  formData.append('userMessage', text);
  formData.append('file', image);
  formData.append('sessionId', sessionId);

  return apiConfig.post(`/chat`, formData)
    .then(response => ({
      content: response.data.content
    }));
};



// 重置會話ID (用於清除對話或開始新對話)
export const resetSessionId = () => {
  currentSessionId = generateSessionId();
  saveSessionId();
  return currentSessionId;
};

// 獲取當前會話ID
export const getCurrentSessionId = () => {
  return currentSessionId;
};