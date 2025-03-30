import {apiConfig} from "../config/ApiConfig";

const generateSessionId = () => crypto.randomUUID();

export const sendMessage = (text, image, sessionId = generateSessionId()) => {
	const formData = new FormData();
	formData.append('userMessage', text);
	formData.append('file', image);
	formData.append('sessionId', sessionId);

	return apiConfig.post(`/chat`, formData)
	.then(response => ({
		content: response.data.content
	}));
};