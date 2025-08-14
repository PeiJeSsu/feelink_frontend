// MessageFactory.js - 修復版本

// 🔧 修復：取得新訊息的 ID
export const getNewId = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) {
        return Date.now(); // 使用時間戳作為起始 ID
    }
    
    // 找出所有有效的數字 ID
    const validIds = messages
        .map(msg => msg.id)
        .filter(id => id && !isNaN(id))
        .map(id => Number(id));
    
    if (validIds.length === 0) {
        return Date.now();
    }
    
    const maxId = Math.max(...validIds);
    return maxId + 1;
};

// 🔧 修復：創建新訊息物件
export const createNewMessage = (id, message, isUser, isImage) => {
    // 確保 ID 是有效的數字
    const validId = id && !isNaN(id) ? Number(id) : Date.now();
    
    return {
        id: validId,
        message: message || '',
        isUser: Boolean(isUser),
        isImage: Boolean(isImage),
        timestamp: new Date().toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        originalTimestamp: new Date().toISOString()
    };
};

// 🔧 修復：添加使用者訊息到聊天
export const addMessages = (messageText, messageImage, currentId, messages, setMessages) => {
    let newId = currentId && !isNaN(currentId) ? Number(currentId) : getNewId(messages);
    
    if (messageText) {
        addSingleMessage(newId, messageText, true, false, setMessages);
        newId++;
    }

    if (messageImage) {
        const imageUrl = URL.createObjectURL(messageImage);
        addSingleMessage(newId, imageUrl, true, true, setMessages);
        newId++;
    }

    return newId;
};

// 🔧 修復：共用函式：根據內容建立訊息並加入訊息陣列
const addSingleMessage = (id, content, isUser, isImage, setMessages) => {
    const message = createNewMessage(id, content, isUser, isImage);
    setMessages(prevMessages => {
        // 確保不會添加重複的訊息
        const exists = prevMessages.some(msg => msg.id === message.id);
        if (exists) {
            console.warn('訊息已存在，跳過添加:', message.id);
            return prevMessages;
        }
        return [...prevMessages, message];
    });
};

// 🔧 修復：追加訊息
export const appendMessage = (id, content, setMessages, isUser = false, isError = false) => {
    const validId = id && !isNaN(id) ? Number(id) : Date.now();
    const message = createNewMessage(validId, content, isUser, isError);
    
    setMessages(prevMessages => {
        // 檢查是否已存在相同 ID 的訊息
        const existingIndex = prevMessages.findIndex(msg => msg.id === validId);
        
        if (existingIndex >= 0) {
            // 更新現有訊息
            const updatedMessages = [...prevMessages];
            updatedMessages[existingIndex] = message;
            return updatedMessages;
        } else {
            // 添加新訊息
            return [...prevMessages, message];
        }
    });
};