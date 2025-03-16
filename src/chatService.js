class ChatService {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.baseUrl = 'http://localhost:8080';
    }

    // 生成唯一的會話ID
    generateSessionId() {
        return 'user-' + Math.random().toString(36).substr(2, 9);
    }

    // 發送訊息並直接獲取AI回應
    sendMessage(message, isUser = true) {
        const formData = new FormData();
        formData.append('userMessage', message);
        formData.append('sessionId', this.sessionId);
        
        return fetch(`${this.baseUrl}/chat`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // 確保返回格式與 sendImage 方法一致
            return {
                content: data.content,  // 假設後端返回的 AI 回應在 content 欄位
                isUser: false,
                isImage: false
            };
        });
    }

    // 發送圖片
    sendImage(imageFile, message) {
        console.log("正在發送消息:", message);
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('userMessage', message);
        formData.append('sessionId', this.sessionId);
        formData.append('isUser', true);
        
        return fetch(`${this.baseUrl}/chat`, {
            method: 'POST',
            body: formData
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