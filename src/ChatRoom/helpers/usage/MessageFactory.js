// 取得新訊息的 ID
export const getNewId = (messages) => {
    return messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 0;
};

// 創建新訊息物件
export const createNewMessage = (id, message, isUser, isImage) => {
    return {
        id,
        message,
        isUser,
        isImage,
        timestamp: new Date().toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
        })
    };
};

// 添加使用者訊息到聊天
export const addMessages = (messageText, messageImage, currentId, messages, setMessages) => {
    let newId = currentId;

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

// 共用函式：根據內容建立訊息並加入訊息陣列
const addSingleMessage = (id, content, isUser, isImage, setMessages) => {
    const message = createNewMessage(id, content, isUser, isImage);
    setMessages(prevMessages => [...prevMessages, message]);
};


export const appendMessage = (id, content, setMessages, isUser = false, isError = false) => {
    const message = createNewMessage(id, content, isUser, isError);
    setMessages(prevMessages => [...prevMessages, message]);
};