import {apiConfig} from "../config/ApiConfig";
import $ from 'jquery';
const generateSessionId = () => crypto.randomUUID();

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

export const sendMessageStream = (text, sessionId, onToken, onComplete, onError) => {
	const formData = new FormData();
	formData.append('userMessage', text);
	formData.append('sessionId', sessionId);

	createSSEStream(`${apiConfig.defaults.baseURL}/chat`, formData, onToken, onComplete, onError);
};

export const sendImageToBackendStream = async (messageText, messageImage, sessionId, onToken, onComplete, onError) => {
	const formData = new FormData();
	formData.append('userMessage', messageText);
	formData.append('file', messageImage);
	formData.append('sessionId', sessionId);

	createSSEStream(`${apiConfig.defaults.baseURL}/analysis`, formData, onToken, onComplete, onError);
};

export const sendCanvasAnalysisToBackendStream = async (messageText, canvasImage, sessionId, onToken, onComplete, onError) => {
	const formData = new FormData();
	formData.append('userMessage', messageText || '請分析這張圖片');
	formData.append('file', canvasImage);
	formData.append('sessionId', sessionId);

	createSSEStream(`${apiConfig.defaults.baseURL}/analysis`, formData, onToken, onComplete, onError);
};


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
export const callAIDrawingAPI = (messageText, canvasData, removeBackground = true, mode = 'drawing') => {
	const requestData = {
		text: messageText,
		imageData: canvasData,
		removeBackground: removeBackground,
		mode: mode
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