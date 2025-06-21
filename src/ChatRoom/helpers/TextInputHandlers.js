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
