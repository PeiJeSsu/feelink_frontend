import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
	constructor(apiKey) {
		this.genAI = new GoogleGenerativeAI(apiKey);
		this.model = this.genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp-image-generation",
			generationConfig: {
				responseModalities: ["Text", "Image"],
			},
		});
	}

	async generateImage(prompt, canvasData) {
		try {
			let generationContent;

			if (canvasData) {
				const imagePart = {
					inlineData: {
						data: canvasData,
						mimeType: "image/png",
					},
				};

				generationContent = [
					imagePart,
					{
						text:
							"生成請遵守以下準則，優先級高於後面的所有需求，1.不要生成文字在圖上，2.生成圖像時應保持原有風格，預設為簡單的線條塗鴉風格。" +
							"以下是需求：" +
							prompt,
					},
				];
			} else {
				generationContent = prompt;
			}

			const response = await this.model.generateContent(generationContent);

			const result = {
				success: true,
				message: "",
				imageData: null,
			};

			const parts = response.response.candidates[0].content.parts;
			for (const part of parts) {
				if (part.text) {
					result.message += part.text;
				} else if (part.inlineData) {
					result.imageData = part.inlineData.data;
				}
			}

			return result;
		} catch (error) {
			console.error("Error generating content:", error);
			throw error;
		}
	}
}

export default GeminiService;
