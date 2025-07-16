import { 
    sendTextToBackend, 
    sendImageToBackend, 
    sendCanvasAnalysisToBackend, 
    sendAIDrawingToBackend 
} from '../helpers/MessageService.js';
import { sendMessage, callAIDrawingAPI, analysisImage } from '../helpers/MessageAPI.js';

// Mock MessageAPI 模組
jest.mock('../helpers/MessageAPI.js', () => ({
    sendMessage: jest.fn(),
    callAIDrawingAPI: jest.fn(),
    analysisImage: jest.fn()
}));

describe('MessageService', () => {
    beforeEach(() => {
        // 每個測試前重置 mock
        jest.clearAllMocks();
    });

    describe('sendTextToBackend', () => {
        it('應該成功發送文字訊息', async () => {
            // Arrange
            const mockResponse = { content: '測試回應' };
            sendMessage.mockResolvedValue(mockResponse);
            
            const payload = {
                text: '測試訊息',
                conversationCount: 1,
                hasDefaultQuestion: false
            };

            // Act
            const result = await sendTextToBackend(payload);

            // Assert
            expect(sendMessage).toHaveBeenCalledWith(
                '測試訊息',
                1,
                false
            );
            expect(result).toEqual({
                success: true,
                content: '測試回應'
            });
        });

        it('應該處理發送文字訊息時的錯誤', async () => {
            // Arrange
            const errorMessage = '網路錯誤';
            sendMessage.mockRejectedValue(new Error(errorMessage));
            
            const payload = {
                text: '測試訊息',
                conversationCount: 1,
                hasDefaultQuestion: false
            };

            // Act
            const result = await sendTextToBackend(payload);

            // Assert
            expect(result).toEqual({
                success: false,
                error: errorMessage
            });
        });

        it('應該處理空的 payload 參數', async () => {
            // Arrange
            const mockResponse = { content: '回應' };
            sendMessage.mockResolvedValue(mockResponse);
            
            const payload = {
                text: '',
                conversationCount: null,
                hasDefaultQuestion: true
            };

            // Act
            const result = await sendTextToBackend(payload);

            // Assert
            expect(sendMessage).toHaveBeenCalledWith(
                '',
                null,
                true
            );
            expect(result.success).toBe(true);
        });
    });

    describe('sendImageToBackend', () => {
        it('應該成功發送圖片訊息', async () => {
            // Arrange
            const mockResponse = { content: '圖片分析結果' };
            analysisImage.mockResolvedValue(mockResponse);
            
            const messageText = '請分析這張圖片';
            const messageImage = 'base64ImageData';

            // Act
            const result = await sendImageToBackend(messageText, messageImage);

            // Assert
            expect(analysisImage).toHaveBeenCalledWith(
                messageText,
                messageImage
            );
            expect(result).toEqual({
                success: true,
                content: '圖片分析結果'
            });
        });

        it('應該處理發送圖片訊息時的錯誤', async () => {
            // Arrange
            const errorMessage = '圖片上傳失敗';
            analysisImage.mockRejectedValue(new Error(errorMessage));
            
            const messageText = '分析圖片';
            const messageImage = 'invalidImageData';

            // Act
            const result = await sendImageToBackend(messageText, messageImage);

            // Assert
            expect(result).toEqual({
                success: false,
                error: errorMessage
            });
        });

        it('應該處理空的圖片資料', async () => {
            // Arrange
            const mockResponse = { content: '處理完成' };
            analysisImage.mockResolvedValue(mockResponse);

            // Act
            const result = await sendImageToBackend('測試文字', null);

            // Assert
            expect(analysisImage).toHaveBeenCalledWith(
                '測試文字',
                null
            );
            expect(result.success).toBe(true);
        });
    });

    describe('sendCanvasAnalysisToBackend', () => {
        it('應該成功發送畫布分析請求', async () => {
            // Arrange
            const mockResponse = { content: '畫布分析結果' };
            analysisImage.mockResolvedValue(mockResponse);
            
            const messageText = '分析這個畫布';
            const canvasImage = 'canvasImageData';

            // Act
            const result = await sendCanvasAnalysisToBackend(messageText, canvasImage);

            // Assert
            expect(analysisImage).toHaveBeenCalledWith(
                messageText,
                canvasImage
            );
            expect(result).toEqual({
                success: true,
                content: '畫布分析結果'
            });
        });

        it('應該在沒有提供訊息文字時使用預設訊息', async () => {
            // Arrange
            const mockResponse = { content: '分析完成' };
            analysisImage.mockResolvedValue(mockResponse);
            
            const canvasImage = 'canvasImageData';

            // Act
            const result = await sendCanvasAnalysisToBackend(null, canvasImage);

            // Assert
            expect(analysisImage).toHaveBeenCalledWith(
                '請分析這張圖片',
                canvasImage
            );
            expect(result.success).toBe(true);
        });

        it('應該在提供空字串時使用預設訊息', async () => {
            // Arrange
            const mockResponse = { content: '分析完成' };
            analysisImage.mockResolvedValue(mockResponse);
            
            const canvasImage = 'canvasImageData';

            // Act
            const result = await sendCanvasAnalysisToBackend('', canvasImage);

            // Assert
            expect(analysisImage).toHaveBeenCalledWith(
                '請分析這張圖片',
                canvasImage
            );
            expect(result.success).toBe(true);
        });

        it('應該處理畫布分析時的錯誤', async () => {
            // Arrange
            const errorMessage = '畫布分析失敗';
            analysisImage.mockRejectedValue(new Error(errorMessage));

            // Act
            const result = await sendCanvasAnalysisToBackend('分析畫布', 'canvasData');

            // Assert
            expect(result).toEqual({
                success: false,
                error: errorMessage
            });
        });
    });

    describe('sendAIDrawingToBackend', () => {
        it('應該成功發送 AI 繪圖請求', async () => {
            // Arrange
            const mockResponse = { content: '繪圖完成' };
            callAIDrawingAPI.mockResolvedValue(mockResponse);
            
            const messageText = '生成一個風景畫';
            const canvasData = 'canvasDrawingData';

            // Act
            const result = await sendAIDrawingToBackend(messageText, canvasData);

            // Assert
            expect(callAIDrawingAPI).toHaveBeenCalledWith(
                messageText,
                canvasData
            );
            expect(result).toEqual({
                success: true,
                content: '繪圖完成'
            });
        });

        it('應該在沒有提供訊息文字時使用預設訊息', async () => {
            // Arrange
            const mockResponse = { content: '繪圖完成' };
            callAIDrawingAPI.mockResolvedValue(mockResponse);
            
            const canvasData = 'canvasDrawingData';

            // Act
            const result = await sendAIDrawingToBackend(null, canvasData);

            // Assert
            expect(callAIDrawingAPI).toHaveBeenCalledWith(
                '請根據這張圖片生成新的內容',
                canvasData
            );
            expect(result.success).toBe(true);
        });

        it('應該在提供空字串時使用預設訊息', async () => {
            // Arrange
            const mockResponse = { content: '繪圖完成' };
            callAIDrawingAPI.mockResolvedValue(mockResponse);
            
            const canvasData = 'canvasDrawingData';

            // Act
            const result = await sendAIDrawingToBackend('', canvasData);

            // Assert
            expect(callAIDrawingAPI).toHaveBeenCalledWith(
                '請根據這張圖片生成新的內容',
                canvasData
            );
            expect(result.success).toBe(true);
        });

        it('應該處理 AI 繪圖時的錯誤', async () => {
            // Arrange
            const errorMessage = 'AI 繪圖服務不可用';
            callAIDrawingAPI.mockRejectedValue(new Error(errorMessage));

            // Act
            const result = await sendAIDrawingToBackend('繪圖請求', 'canvasData');

            // Assert
            expect(result).toEqual({
                success: false,
                error: errorMessage
            });
        });

        it('應該處理回應格式不同的情況', async () => {
            // Arrange
            const mockResponse = '直接回應字串';
            callAIDrawingAPI.mockResolvedValue(mockResponse);

            // Act
            const result = await sendAIDrawingToBackend('繪圖請求', 'canvasData');

            // Assert
            expect(result).toEqual({
                success: true,
                content: '直接回應字串'
            });
        });
    });

    describe('錯誤處理和邊界情況', () => {
        it('應該處理 sendMessage 回傳 undefined 的情況', async () => {
            // Arrange
            sendMessage.mockResolvedValue(undefined);
            
            const payload = {
                text: '測試訊息',
                conversationCount: 1,
                hasDefaultQuestion: false
            };

            // Act
            const result = await sendTextToBackend(payload);

            // Assert
            expect(result).toEqual({
                success: false,
                error: "Cannot read properties of undefined (reading 'content')"
            });
        });

        it('應該處理 sendMessage 回傳 null 的情況', async () => {
            // Arrange
            sendMessage.mockResolvedValue(null);
            
            const payload = {
                text: '測試訊息',
                conversationCount: 1,
                hasDefaultQuestion: false
            };

            // Act
            const result = await sendTextToBackend(payload);

            // Assert
            expect(result).toEqual({
                success: false,
                error: "Cannot read properties of null (reading 'content')"
            });
        });

        it('應該處理 sendMessage 回傳空物件的情況', async () => {
            // Arrange
            sendMessage.mockResolvedValue({});
            
            const payload = {
                text: '測試訊息',
                conversationCount: 1,
                hasDefaultQuestion: false
            };

            // Act
            const result = await sendTextToBackend(payload);

            // Assert
            expect(result).toEqual({
                success: true,
                content: {}
            });
        });

        it('應該處理 callAIDrawingAPI 回傳物件但沒有 content 的情況', async () => {
            // Arrange
            const mockResponse = { status: 'success', data: '繪圖資料' };
            callAIDrawingAPI.mockResolvedValue(mockResponse);

            // Act
            const result = await sendAIDrawingToBackend('繪圖請求', 'canvasData');

            // Assert
            expect(result).toEqual({
                success: true,
                content: mockResponse
            });
        });

        it('應該處理 analysisImage 回傳物件但沒有 content 的情況', async () => {
            // Arrange
            const mockResponse = { status: 'success', data: '分析資料' };
            analysisImage.mockResolvedValue(mockResponse);

            // Act
            const result = await sendImageToBackend('分析圖片', 'imageData');

            // Assert
            expect(result).toEqual({
                success: true,
                content: mockResponse
            });
        });

        it('應該處理網路超時錯誤', async () => {
            // Arrange
            const timeoutError = new Error('Request timeout');
            timeoutError.code = 'TIMEOUT';
            sendMessage.mockRejectedValue(timeoutError);
            
            const payload = {
                text: '測試訊息',
                conversationCount: 1,
                hasDefaultQuestion: false
            };

            // Act
            const result = await sendTextToBackend(payload);

            // Assert
            expect(result).toEqual({
                success: false,
                error: 'Request timeout'
            });
        });

        it('應該處理 analysisImage 的網路錯誤', async () => {
            // Arrange
            const networkError = new Error('Network error');
            analysisImage.mockRejectedValue(networkError);

            // Act
            const result = await sendImageToBackend('分析圖片', 'imageData');

            // Assert
            expect(result).toEqual({
                success: false,
                error: 'Network error'
            });
        });
    });
});