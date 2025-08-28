export function isValidMessage(message) {
	return message.trim().length > 0;
}

export function handleSendText(message, setMessage, onSendMessage, disabled) {
	if (!disabled && isValidMessage(message)) {
		onSendMessage(message);
		setMessage('');
	}
}

export function handleSendImage(imageInputRef) {
	imageInputRef.current.click();
}

export function handleMessageChange(event, setMessage) {
	setMessage(event.target.value);
}

export function handleImageChange(event, message, setMessage, onUploadImage) {
	const file = event.target.files[0];
	if (file?.type?.startsWith('image/')) {
		onUploadImage(message, file);
		setMessage('');
		event.target.value = '';
	}
}

export function handleAnalyzeCanvas(message, setMessage, onAnalyzeCanvas) {
	if (onAnalyzeCanvas) {
		onAnalyzeCanvas(message);
		setMessage('');
	}
}

export function handleAIDrawing(message, setMessage, onAIDrawing) {
	if (onAIDrawing) {
		onAIDrawing(message);
		setMessage('');
	}
}

export function handleGenerateObject(message, setMessage, onGenerateObject) {
	if (onGenerateObject) {
		onGenerateObject(message);
		setMessage('');
	}
}

export function handleKeyDown(event, message, setMessage, onSendMessage, disabled) {
	// 檢查是否按下 Enter 鍵但沒有按住 Shift 鍵
	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault(); // 防止換行
		handleSendText(message, setMessage, onSendMessage, disabled);
	}
}
