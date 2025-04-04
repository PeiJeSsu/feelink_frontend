import { useState } from "react";
import { handleSendImageMessage, handleSendTextMessage, handleSendCanvasAnalysis } from "../helpers/HandleSendMessage";

export default function useChatMessages() {
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
        handleSendTextMessage(messageText, messages, setMessages, setLoading, currentQuestion,nextCount);
    };

    const sendImageMessage = (messageText, messageImage) => {
        handleSendImageMessage(messageText, messageImage, messages, setMessages, setLoading);
    };

    const sendCanvasAnalysis = async (canvasImage, messageText) => {
        handleSendCanvasAnalysis(canvasImage, messageText, messages, setMessages, setLoading);
    };
    const addSystemMessage = (text) => {
        setCurrentQuestion(text);
        setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now(), message: text, isUser: false, isImage: false }
        ]);
    };
    return { messages, loading, predefinedQuestions, sendTextMessage, sendImageMessage, sendCanvasAnalysis, addSystemMessage };
}