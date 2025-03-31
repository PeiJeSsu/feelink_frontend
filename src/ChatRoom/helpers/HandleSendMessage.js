import {sendMessage} from "./HandleSendMessageApiConn";

export const handleSendTextMessage = async (messageText, messages, setMessages, setLoading) => {
    if (!messageText) return;

    try {
        setLoading(true);
        const sendId = getNewId(messages);
        
        // 保存發送的訊息
        const sendMessage = createNewMessage(sendId, messageText, true, false);
        setMessages(prevMessages => [...prevMessages, sendMessage]);

        // 等待接收回應
        const response = await saveReceiveMessage(sendId + 1, messageText, null);
        setMessages(prevMessages => [...prevMessages, response]);
    } catch (error) {
        console.error('發送訊息失敗:', error);
        const errorMessage = createNewMessage(
            getNewId(messages) + 2,
            "抱歉，處理訊息時發生錯誤。",
            false,
            false
        );
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setLoading(false);
    }
};

export const handleSendImageMessage = async (messageText, messageImage, messages, setMessages, setLoading) => {
    if (!messageText && !messageImage) return;

    try {
        setLoading(true);
        const baseId = getNewId(messages);
        let currentId = baseId;

        // 如果有文字訊息，先發送文字
        if (messageText) {
            const textMessage = createNewMessage(currentId, messageText, true, false);
            setMessages(prevMessages => [...prevMessages, textMessage]);
            currentId++;
        }

        // 發送圖片
        if (messageImage) {
            const imageUrl = URL.createObjectURL(messageImage);
            const imageMessage = createNewMessage(currentId, imageUrl, true, true);
            setMessages(prevMessages => [...prevMessages, imageMessage]);
            currentId++;
        }

        // 等待接收回應
        const response = await saveReceiveMessage(currentId, messageText, messageImage);
        setMessages(prevMessages => [...prevMessages, response]);
    } catch (error) {
        console.error('發送圖片失敗:', error);
        const errorMessage = createNewMessage(
            getNewId(messages) + 3,
            "抱歉，處理圖片時發生錯誤。",
            false,
            false
        );
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setLoading(false);
    }
};

export const handleSendCanvasAnalysis = async (canvasImage, messageText, messages, setMessages, setLoading) => {
    if (!canvasImage) return;

    try {
        setLoading(true);
        const baseId = getNewId(messages);
        let currentId = baseId;

        // 如果有文字訊息，先顯示文字
        if (messageText) {
            const textMessage = createNewMessage(currentId, messageText, true, false);
            setMessages(prevMessages => [...prevMessages, textMessage]);
            currentId++;
        }
        
        // 保存畫布圖片訊息
        const imageUrl = URL.createObjectURL(canvasImage);
        const imageMessage = createNewMessage(currentId, imageUrl, true, true);
        setMessages(prevMessages => [...prevMessages, imageMessage]);
        currentId++;

        // 發送到後端進行分析
        const response = await sendMessage(messageText || "請分析這張圖片", canvasImage);
        
        // 保存分析結果
        const analysisMessage = createNewMessage(
            currentId,
            response.content,
            false,
            false
        );
        setMessages(prevMessages => [...prevMessages, analysisMessage]);
    } catch (error) {
        console.error('分析失敗:', error);
        const errorMessage = createNewMessage(
            getNewId(messages) + 2,
            "抱歉，分析過程中發生錯誤。",
            false,
            false
        );
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setLoading(false);
    }
};

const getNewId = (messages) => {
    if (messages.length === 0) return 1;
    return Math.max(...messages.map(m => m.id)) + 1;
};

const saveReceiveMessage = async (id, messageText, messageImage) => {
    const response = await sendMessage(messageText, messageImage);
    return createNewMessage(id, response.content, false, false);
};

const createNewMessage = (id, message, isUser, isImage) => {
    return {
        id: id,
        message: message,
        isUser: isUser,
        isImage: isImage
    };
};