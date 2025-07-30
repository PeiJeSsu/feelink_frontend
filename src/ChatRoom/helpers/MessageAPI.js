import {apiConfig} from "../config/ApiConfig";

const generateSessionId = () => crypto.randomUUID();

export const sendMessage = (text, conversationCount , hasDefaultQuestion , sessionId = generateSessionId()) => {
	const formData = new FormData();
	formData.append('userMessage', text);
	formData.append('sessionId', sessionId);
	
	if (conversationCount !== null) {
		formData.append('conversationCount', conversationCount);
		formData.append('hasDefaultQuestion', hasDefaultQuestion);
	}

	return apiConfig.post(`/chat`, formData)
	.then(response => ({
		content: response.data.content
	}));
};
export const callAIDrawingAPI = (messageText, canvasData) => {
	const requestData = {
		text: messageText,
		imageData: canvasData
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
export const analysisImage =(text, file ,sessionId = generateSessionId()) =>{
	const formData = new FormData();
	formData.append('userMessage', text);
	formData.append('sessionId', sessionId);
	
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
}