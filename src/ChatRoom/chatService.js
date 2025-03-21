import axios from 'axios';

class ChatService {
    constructor(sessionId = null) {
        this.sessionId = sessionId || this.generateSessionId();
        this.baseUrl = 'http://localhost:8080';
    }

    generateSessionId() {
        return crypto.randomUUID();
    }

    sendMessage(message) {
        const formData = new FormData();
        formData.append('userMessage', message);
        formData.append('sessionId', this.sessionId);

        return axios.post(`${this.baseUrl}/chat`, formData)
            .then(response => ({
                content: response.data.content,
                isUser: false,
                isImage: false
            }));
    }

    sendImage(imageFile, message) {
        console.log("正在發送消息:", message);
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('userMessage', message);
        formData.append('sessionId', this.sessionId);

        return axios.post(`${this.baseUrl}/chat`, formData)
            .then(response => response.data);
    }

    callApi(message) {
        return axios.post(`${this.baseUrl}/api-message`, null, {
            params: {
                message: message,
                sessionId: this.sessionId
            }
        }).then(response => response.data);
    }

    getChatHistory() {
        return axios.get(`${this.baseUrl}/history/${this.sessionId}`)
            .then(response => response.data);
    }
    
    getLatestResponse() {
        return axios.get(`${this.baseUrl}/latest-response/${this.sessionId}`)
            .then(response => {
                // axios 會在沒有內容時拋出錯誤，這裡處理 204 狀態
                if (response.status === 204) {
                    return null;
                }
                return response.data;
            })
            .catch(error => {
                if (error.response && error.response.status === 204) {
                    return null;
                }
                throw error;
            });
    }
}

export default new ChatService(); 
export { ChatService };