/**
 * 顯示文件加載中提示
 * @returns {HTMLElement} - 提示元素
 */
export const showLoadingMessage = (message = "正在加載文件...") => {
	const loadingMessage = document.createElement("div");
	loadingMessage.style.position = "fixed";
	loadingMessage.style.top = "50%";
	loadingMessage.style.left = "50%";
	loadingMessage.style.transform = "translate(-50%, -50%)";
	loadingMessage.style.padding = "20px";
	loadingMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
	loadingMessage.style.color = "white";
	loadingMessage.style.borderRadius = "8px";
	loadingMessage.style.zIndex = "9999";
	loadingMessage.textContent = message;
	document.body.appendChild(loadingMessage);

	return loadingMessage;
};

/**
 * 隱藏文件加載中提示
 * @param {HTMLElement} loadingMessage - 提示元素
 */
export const hideLoadingMessage = (loadingMessage) => {
	loadingMessage?.parentNode?.removeChild(loadingMessage);
};
