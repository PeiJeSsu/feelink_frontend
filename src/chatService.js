class ChatService {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.baseUrl = 'http://localhost:8080/api/chat';
    }

    // 生成唯一的會話ID
    generateSessionId() {
        return 'user-' + Math.random().toString(36).substr(2, 9);
    }

    // 發送訊息
    sendMessage(message, isUser = true) {
        return fetch(`${this.baseUrl}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: message,
                isUser: isUser,
                sessionId: this.sessionId
            })
        }).then(response => response.json());
    }

    // 呼叫API
    callApi(message) {
        return fetch(`${this.baseUrl}/api-message?message=${encodeURIComponent(message)}&sessionId=${this.sessionId}`, {
            method: 'POST'
        }).then(response => response.json());
    }

    // 獲取聊天歷史
    getChatHistory() {
        return fetch(`${this.baseUrl}/history/${this.sessionId}`)
            .then(response => response.json());
    }

    // 檢查是否有新的API回應
    getLatestResponse() {
        return fetch(`${this.baseUrl}/latest-response/${this.sessionId}`)
            .then(response => {
                if (response.status === 204) {  // 沒有內容
                    return null;
                }
                return response.json();
            });
    }
}

export default new ChatService();