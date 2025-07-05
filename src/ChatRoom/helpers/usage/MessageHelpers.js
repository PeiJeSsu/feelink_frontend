// 將 Blob 轉換為 base64
export const convertBlobToBase64 = async (blob) => {
	const reader = new FileReader();
	return new Promise((resolve, reject) => {
		reader.onload = () => resolve(reader.result.split(',')[1]);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	}); 
};