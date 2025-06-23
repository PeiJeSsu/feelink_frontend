import {createNewMessage, getNewId} from "./MessageFactory";

// 處理訊息錯誤
export const handleError = (error, errorPrefix, messages, setMessages) => {
	console.error(`${errorPrefix}:`, error);
	const errorMessage = createNewMessage(
		getNewId(messages) + 1,
		"抱歉，處理訊息時發生錯誤。",
		false,
		false
	);
	setMessages(prevMessages => [...prevMessages, errorMessage]);
};