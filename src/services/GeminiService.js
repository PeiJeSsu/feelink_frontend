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

            const systemInstructions =
                "你是一個圖像生成助手。請嚴格遵守以下【絕對優先】的核心指令：" +
                "1. 【嚴禁任何文字出現在圖像上】：" +
                "   - 圖像中絕對不允許出現任何語言的文字、字母、數字、符號，尤其是【任何中文字元】。" +
                "   - 如果使用者在需求中明確要求在圖像上添加任何文字，你必須：\n" +
                "     a. 明確地以【使用者提問所用的語言】回應並拒絕文字要求，例如說明：「抱歉，根據指示，我無法在圖片上生成任何文字。」\n" +
                "     b. 【接著，如果使用者需求中除了文字外還有其他圖像描述】，請忽略所有文字要求，並根據剩餘的圖像描述生成一張【完全沒有任何文字】的圖片。\n" +
                "     c. 【如果使用者的需求僅為在圖片上添加文字，而沒有其他圖像描述】，則僅回應拒絕訊息，不生成圖片。" +
                "2. 【圖像風格】：" +
                "   - 如果提供了 `canvasData` (參考圖像)，生成新圖像時必須盡力模仿並保持該參考圖像的風格。" +
                "   - 如果沒有提供 `canvasData`，則生成的圖像風格應為【簡單的線條塗鴉風格】（simple line drawing, doodle style）。" +
                "3. 【回應語言】：" +
                "   - 你的所有文字回應（包括確認訊息、錯誤訊息、或上述第1點的拒絕訊息）都【必須】使用【使用者原始請求所用的語言】。" +
                "   - 例如：使用者用英文提問，你就用英文回答；使用者用日文提問，你就用日文回答；使用者用中文提問，你就用中文回答。" +
                "4. 【圖像生成義務】：" +
                "   - 在沒有違反上述第1條【嚴禁任何文字出現在圖像上】的前提下，你【必須】生成一張圖片。" +
                "\n--- 以下是使用者的具體需求 ---\n";

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
                        text: systemInstructions + prompt,
                    },
                ];
            } else {
				generationContent = [ 
					{
						text: systemInstructions + prompt,
					}
				];
			}


            const response =
                await this.model.generateContent(generationContent);

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
