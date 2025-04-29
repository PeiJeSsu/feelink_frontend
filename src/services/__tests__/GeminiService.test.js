import GeminiService from '../GeminiService';
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock('@google/generative-ai');

describe('GeminiService', () => {
    let mockGenerateContent;
    let mockGetGenerativeModel;
    let geminiService;
    const mockApiKey = 'test-api-key';

    beforeEach(() => {
        // 設置 mock 函數
        mockGenerateContent = jest.fn();
        mockGetGenerativeModel = jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        // 設置 GoogleGenerativeAI mock
        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        // 創建服務實例
        geminiService = new GeminiService(mockApiKey);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('應正確初始化', () => {
            expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
            expect(mockGetGenerativeModel).toHaveBeenCalledWith({
                model: "gemini-2.0-flash-exp-image-generation",
                generationConfig: {
                    responseModalities: ["Text", "Image"]
                }
            });
        });
    });

    describe('generateImage', () => {
        const mockPrompt = "測試提示";
        const mockCanvasData = "base64-encoded-image-data";
        
        test('應正確處理純文字提示', async () => {
            const mockResponse = {
                response: {
                    candidates: [{
                        content: {
                            parts: [
                                { text: "生成的描述" },
                                { inlineData: { data: "generated-image-data" } }
                            ]
                        }
                    }]
                }
            };
            mockGenerateContent.mockResolvedValueOnce(mockResponse);

            const result = await geminiService.generateImage(mockPrompt);


            expect(mockGenerateContent).toHaveBeenCalledWith(mockPrompt);
            expect(result).toEqual({
                success: true,
                message: "生成的描述",
                imageData: "generated-image-data"
            });
        });

        test('應正確處理帶有畫布的提示', async () => {
            const mockResponse = {
                response: {
                    candidates: [{
                        content: {
                            parts: [
                                { text: "圖片描述" },
                                { inlineData: { data: "generated-image-data" } }
                            ]
                        }
                    }]
                }
            };
            mockGenerateContent.mockResolvedValueOnce(mockResponse);

            const result = await geminiService.generateImage(mockPrompt, mockCanvasData);

            expect(mockGenerateContent).toHaveBeenCalledWith([
                {
                    inlineData: {
                        data: mockCanvasData,
                        mimeType: "image/png"
                    }
                },
                {
                    text: expect.stringContaining(mockPrompt)
                }
            ]);
            expect(result).toEqual({
                success: true,
                message: "圖片描述",
                imageData: "generated-image-data"
            });
        });

        test('應正確處理只有文字回應的情況', async () => {
            const mockResponse = {
                response: {
                    candidates: [{
                        content: {
                            parts: [
                                { text: "只有文字的回應" }
                            ]
                        }
                    }]
                }
            };
            mockGenerateContent.mockResolvedValueOnce(mockResponse);

            const result = await geminiService.generateImage(mockPrompt);

            expect(result).toEqual({
                success: true,
                message: "只有文字的回應",
                imageData: null
            });
        });

        test('應正確處理只有圖片回應的情況', async () => {
            const mockResponse = {
                response: {
                    candidates: [{
                        content: {
                            parts: [
                                { inlineData: { data: "only-image-data" } }
                            ]
                        }
                    }]
                }
            };
            mockGenerateContent.mockResolvedValueOnce(mockResponse);

            const result = await geminiService.generateImage(mockPrompt);

            expect(result).toEqual({
                success: true,
                message: "",
                imageData: "only-image-data"
            });
        });

        test('應在生成失敗時拋出錯誤', async () => {
            const mockError = new Error('API 錯誤');
            mockGenerateContent.mockRejectedValueOnce(mockError);

            await expect(geminiService.generateImage(mockPrompt))
                .rejects
                .toThrow('API 錯誤');
        });
    });
});