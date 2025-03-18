import * as fabric from "fabric";

export const importImage = (file, canvas, callback) => {
	const reader = new FileReader();
	reader.onload = (event) => {
		const imgObj = new Image();
		imgObj.src = event.target.result;
		imgObj.onload = () => {
			const fabricImage = new fabric.FabricImage(imgObj);

			// 調整圖片大小以適應畫布
			const scale = Math.min((canvas.width * 0.8) / fabricImage.width, (canvas.height * 0.8) / fabricImage.height);

			fabricImage.scale(scale);

			// 將圖片置於畫布中央
			fabricImage.set({
				left: (canvas.width - fabricImage.width * scale) / 2,
				top: (canvas.height - fabricImage.height * scale) / 2,
			});

			canvas.add(fabricImage);
			canvas.renderAll();

			// 保存歷史記錄
			if (canvas.historyManager) {
				canvas.historyManager.saveState();
			}

			if (callback) callback();
		};
	};
	reader.readAsDataURL(file);
};
