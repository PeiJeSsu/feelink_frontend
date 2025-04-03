import { useState } from "react";
import { handleSendImageMessage, handleSendTextMessage, handleSendCanvasAnalysis } from "../helpers/HandleSendMessage";

export default function useChatMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(""); 
    const predefinedQuestions = [
        "今天過得如何？",
        "最近有沒有遇到什麼有趣的事？",
        "有沒有什麼想聊的話題？",
        "今天想要畫些什麼呢？",
        "最近有什麼讓你開心的事情嗎？"
    ];

    const sendTextMessage = (messageText) => {
        handleSendTextMessage(messageText, messages, setMessages, setLoading, currentQuestion);
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