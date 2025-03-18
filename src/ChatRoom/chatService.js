class ChatService {
    constructor(sessionId = null) {
        this.sessionId = sessionId || this.generateSessionId();
        this.baseUrl = 'http://localhost:8080';
    }

    generateSessionId() {
        return 'user-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    sendMessage(message) {
        const formData = new FormData();
        formData.append('userMessage', message);
        formData.append('sessionId', this.sessionId);

        return fetch(`${this.baseUrl}/chat`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => ({
            content: data.content,
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

        return fetch(`${this.baseUrl}/chat`, {
            method: 'POST',
            body: formData
        }).then(response => response.json());
    }

    callApi(message) {
        return fetch(`${this.baseUrl}/api-message?message=${encodeURIComponent(message)}&sessionId=${this.sessionId}`, {
            method: 'POST'
        }).then(response => response.json());
    }

    getChatHistory() {
        return fetch(`${this.baseUrl}/history/${this.sessionId}`, { method: 'GET' })
            .then(response => response.json());
    }
    
    getLatestResponse() {
        return fetch(`${this.baseUrl}/latest-response/${this.sessionId}`, { method: 'GET' })
            .then(response => response.status === 204 ? null : response.json());
    }
}

export default new ChatService(); 
export { ChatService }; 
