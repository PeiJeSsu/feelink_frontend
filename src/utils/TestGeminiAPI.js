import axios from 'axios';

const testGeminiAPI = async () => {
    try {
        console.log('開始測試 Gemini API...');

        console.log('測試圖片生成...');
        const imageResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: "畫一隻可愛的貓" }]
                }],
                generationConfig: {
                    responseModalities: ["Text", "Image"]
                }
            }
        );
        console.log('圖片生成測試成功：', imageResponse.data);
 

        return true;
    } catch (error) {
        console.error('API 測試失敗：', error.response?.data || error.message);
        return false;
    }
};

export default testGeminiAPI; 