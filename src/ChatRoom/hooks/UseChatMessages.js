import { useState } from "react";
import { handleSendImageMessage, handleSendTextMessage, handleSendCanvasAnalysis, handleSendAIDrawing } from "../helpers/HandleSendMessage";

export default function useChatMessages(canvas) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [conversationCount, setConversationCount] = useState(0);
    
    const predefinedQuestions = [
        "最近過得如何，有沒有發生甚麼有趣或難過的事？",
        "今天的心情如何呢",
        "最近有沒有讓你開心或困擾的事呢？"
    ];
    const sendTextMessage = (messageText) => {
        const nextCount = conversationCount + 1; 
        setConversationCount(nextCount); 
        handleSendTextMessage(messageText, messages, setMessages, setLoading, currentQuestion, nextCount);
    };

    const sendImageMessage = (messageText, messageImage) => {
        handleSendImageMessage(messageText, messageImage, messages, setMessages, setLoading);
    };

    const addSystemMessage = (text) => {
        setCurrentQuestion(text);
        setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now(), message: text, isUser: false, isImage: false }
        ]);
    };

    const sendCanvasAnalysis = async (messageText) => {
        if (!canvas) {
            console.error('沒有可用的畫布');
            return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        await handleSendCanvasAnalysis(blob, messageText, messages, setMessages, setLoading);
    };

    const sendAIDrawing = async (messageText) => {
        if (!canvas) {
            console.error('沒有可用的畫布');
            return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        await handleSendAIDrawing(blob, messageText, messages, setMessages, setLoading, canvas);
    };

    return { 
        messages, 
        loading, 
        predefinedQuestions, 
        sendTextMessage, 
        sendImageMessage, 
        sendCanvasAnalysis, 
        sendAIDrawing, 
        addSystemMessage,
    };
}