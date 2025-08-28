import { saveCanvasToFile } from "./CanvasSerialization";
import { loadCanvasFromFile } from "./LoadCanvas";
import { showLoadingMessage, hideLoadingMessage } from "./LoadingMessage";

export const handleSaveFile = (canvas) => {
	if (!canvas) {
		console.error("畫布未初始化");
		return;
	}

	const fileName = prompt("請輸入保存的文件名:", "drawing.feelink");
	if (!fileName) return;

	const success = saveCanvasToFile(canvas, fileName);
	if (success) {
		alert("檔案保存成功！");
	} else {
		alert("檔案保存失敗，請重試。");
	}
};

export const handleLoadFile = (fileInputRef, canvasReady) => {
	if (!canvasReady) {
		alert("畫布尚未準備好，請稍後再試");
		return;
	}
	fileInputRef.current.click();
};

export const handleFileInputChange = (event, canvas, canvasReady) => {
	const file = event.target.files[0];
	if (!file) return;

	// 保存 loading message 的引用
	const loadingMessage = showLoadingMessage();

	loadCanvasFromFile(canvas, file, (success, error) => {
		// 確保一定會移除 loading message
		hideLoadingMessage(loadingMessage);

		if (success) {
			// 成功載入後清空歷史堆疊
			if (canvas.historyManager) {
				canvas.historyManager.clear();
				// 保存當前狀態作為新的起始點
				canvas.historyManager.saveState();
			}
			alert("檔案載入成功！");
		} else {
			alert(`檔案載入失敗：${error?.message || "未知錯誤"}`);
		}
	});

	event.target.value = "";
};
