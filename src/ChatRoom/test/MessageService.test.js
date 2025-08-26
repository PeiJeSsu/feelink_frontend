import {
    sendTextToBackend,
    sendImageToBackend,
    sendCanvasAnalysisToBackend,
    sendAIDrawingToBackend,
    sendAIDrawingToBackendStream,
    sendTextToBackendStream,
    sendImageToBackendStreamService,
    sendCanvasAnalysisToBackendStreamService,
    loadChatroomHistoryService,
    loadTextMessagesService,
    loadDrawingMessagesService,
    loadUserMessagesService,
    loadAIMessagesService
} from '../helpers/MessageService';

// Mock MessageAPI 模組
jest.mock('../helpers/MessageAPI', () => ({
    sendMessage: jest.fn(),
    callAIDrawingAPI: jest.fn(),
    callAIDrawingAPIStream: jest.fn(),
    sendMessageStream: jest.fn(),
    analysisImage: jest.fn(),
    sendImageToBackendStream: jest.fn(),
    sendCanvasAnalysisToBackendStream: jest.fn(),
    loadChatroomMessages: jest.fn(),
    loadChatroomTextMessages: jest.fn(),
    loadChatroomDrawingMessages: jest.fn(),
    loadUserMessages: jest.fn(),
    loadAIMessages: jest.fn()
}));

import {
    sendMessage,
    callAIDrawingAPI,
    callAIDrawingAPIStream,
    sendMessageStream,
    analysisImage,
    sendImageToBackendStream,
    sendCanvasAnalysisToBackendStream,
    loadChatroomMessages,
    loadChatroomTextMessages,
    loadChatroomDrawingMessages,
    loadUserMessages,
    loadAIMessages
} from '../helpers/MessageAPI';

describe('MessageService', () => {
    beforeEach(() => {
        // 清除所有 mock 的調用記錄
        jest.clearAllMocks();
    });

    describe('sendTextToBackend', () => {
        it('應該成功發送文字訊息', async () => {
            const mockResponse = { content: '測試回應' };
            sendMessage.mockResolvedValue(mockResponse);

            const payload = { 
                text: '測試訊息', 
                conversationCount: 1, 
                hasDefaultQuestion: false 
            };
            const chatroomId = 'chatroom123';

            const result = await sendTextToBackend(payload, chatroomId);

            expect(sendMessage).toHaveBeenCalledWith(
                payload.text, 
                payload.conversationCount, 
                payload.hasDefaultQuestion, 
                chatroomId
            );
            expect(result).toEqual({
                success: true,
                content: mockResponse.content
            });
        });

        it('應該處理發送文字訊息失敗的情況', async () => {
            const errorMessage = '網路錯誤';
            sendMessage.mockRejectedValue(new Error(errorMessage));

            const payload = { text: '測試訊息', conversationCount: 1, hasDefaultQuestion: false };
            const chatroomId = 'chatroom123';

            const result = await sendTextToBackend(payload, chatroomId);

            expect(result).toEqual({
                success: false,
                error: errorMessage
            });
        });
    });

    describe('sendImageToBackend', () => {
        it('應該成功發送圖片分析請求', async () => {
            const mockResponse = { content: '圖片分析結果' };
            analysisImage.mockResolvedValue(mockResponse);

            const messageText = '分析這張圖片';
            const messageImage = 'base64ImageData';
            const chatroomId = 'chatroom123';

            const result = await sendImageToBackend(messageText, messageImage, chatroomId);

            expect(analysisImage).toHaveBeenCalledWith(messageText, messageImage, chatroomId);
            expect(result).toEqual({
                success: true,
                content: mockResponse.content
            });
        });

        it('應該處理圖片分析失敗的情況', async () => {
            const errorMessage = '圖片分析失敗';
            analysisImage.mockRejectedValue(new Error(errorMessage));

            const result = await sendImageToBackend('測試', 'imageData', 'chatroom123');

            expect(result).toEqual({
                success: false,
                error: errorMessage
            });
        });
    });

    describe('sendCanvasAnalysisToBackend', () => {
        it('應該使用提供的文字發送畫布分析', async () => {
            const mockResponse = { content: '畫布分析結果' };
            analysisImage.mockResolvedValue(mockResponse);

            const messageText = '自訂分析文字';
            const canvasImage = 'canvasImageData';
            const chatroomId = 'chatroom123';

            const result = await sendCanvasAnalysisToBackend(messageText, canvasImage, chatroomId);

            expect(analysisImage).toHaveBeenCalledWith(messageText, canvasImage, chatroomId);
            expect(result.success).toBe(true);
        });

        it('應該使用預設文字當沒有提供文字時', async () => {
            const mockResponse = { content: '畫布分析結果' };
            analysisImage.mockResolvedValue(mockResponse);

            const canvasImage = 'canvasImageData';
            const chatroomId = 'chatroom123';

            await sendCanvasAnalysisToBackend(null, canvasImage, chatroomId);

            expect(analysisImage).toHaveBeenCalledWith('請分析這張圖片', canvasImage, chatroomId);
        });
    });

    describe('sendAIDrawingToBackend', () => {
        it('應該成功發送AI繪圖請求', async () => {
            const mockResponse = { content: 'AI繪圖結果' };
            callAIDrawingAPI.mockResolvedValue(mockResponse);

            const messageText = '生成一張圖片';
            const canvasData = 'canvasData';
            const chatroomId = 'chatroom123';

            const result = await sendAIDrawingToBackend(messageText, canvasData, chatroomId);

            expect(callAIDrawingAPI).toHaveBeenCalledWith(messageText, canvasData, true, chatroomId);
            expect(result).toEqual({
                success: true,
                content: mockResponse.content
            });
        });

        it('應該使用預設訊息當沒有提供文字時', async () => {
            const mockResponse = { content: 'AI繪圖結果' };
            callAIDrawingAPI.mockResolvedValue(mockResponse);

            await sendAIDrawingToBackend(null, 'canvasData', 'chatroom123');

            expect(callAIDrawingAPI).toHaveBeenCalledWith(
                '請根據這張圖片生成新的內容', 
                'canvasData', 
                true, 
                'chatroom123'
            );
        });
    });

    describe('sendAIDrawingToBackendStream', () => {
        it('應該呼叫串流版本的AI繪圖API', async () => {
            const mockCallbacks = {
                onToken: jest.fn(),
                onComplete: jest.fn(),
                onError: jest.fn(),
                onImageGenerated: jest.fn()
            };

            callAIDrawingAPIStream.mockResolvedValue('stream_result');

            const messageText = '串流繪圖';
            const canvasData = 'canvasData';
            const chatroomId = 'chatroom123';

            const result = await sendAIDrawingToBackendStream(
                messageText, 
                canvasData, 
                chatroomId, 
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError,
                mockCallbacks.onImageGenerated
            );

            expect(callAIDrawingAPIStream).toHaveBeenCalledWith(
                messageText,
                canvasData,
                true,
                chatroomId,
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError,
                mockCallbacks.onImageGenerated
            );
            expect(result).toBe('stream_result');
        });
    });

    describe('sendTextToBackendStream', () => {
        it('應該呼叫串流版本的文字發送API', async () => {
            const mockCallbacks = {
                onToken: jest.fn(),
                onComplete: jest.fn(),
                onError: jest.fn()
            };

            sendMessageStream.mockResolvedValue('stream_result');

            const payload = { text: '串流文字' };
            const chatroomId = 'chatroom123';

            const result = await sendTextToBackendStream(
                payload,
                chatroomId,
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError
            );

            expect(sendMessageStream).toHaveBeenCalledWith(
                payload.text,
                chatroomId,
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError
            );
            expect(result).toBe('stream_result');
        });
    });

    describe('sendImageToBackendStreamService', () => {
        it('應該呼叫串流版本的圖片發送API', async () => {
            const mockCallbacks = {
                onToken: jest.fn(),
                onComplete: jest.fn(),
                onError: jest.fn()
            };

            sendImageToBackendStream.mockResolvedValue('stream_result');

            const messageText = '分析圖片';
            const messageImage = 'imageData';
            const chatroomId = 'chatroom123';

            const result = await sendImageToBackendStreamService(
                messageText,
                messageImage,
                chatroomId,
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError

            );

            expect(sendImageToBackendStream).toHaveBeenCalledWith(
                messageText,
                messageImage,
                chatroomId,
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError
            );
            expect(result).toBe('stream_result');
        });
    });

    describe('sendCanvasAnalysisToBackendStreamService', () => {
        it('應該呼叫串流版本的畫布分析API', async () => {
            const mockCallbacks = {
                onToken: jest.fn(),
                onComplete: jest.fn(),
                onError: jest.fn()
            };

            sendCanvasAnalysisToBackendStream.mockResolvedValue('stream_result');

            const messageText = '分析畫布';
            const canvasImage = 'canvasData';
            const chatroomId = 'chatroom123';

            const result = await sendCanvasAnalysisToBackendStreamService(
                messageText,
                canvasImage,
                chatroomId,
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError
            );

            expect(sendCanvasAnalysisToBackendStream).toHaveBeenCalledWith(
                messageText,
                canvasImage,
                chatroomId,
                mockCallbacks.onToken,
                mockCallbacks.onComplete,
                mockCallbacks.onError
            );
            expect(result).toBe('stream_result');
        });
    });

    describe('loadChatroomHistoryService', () => {
        it('應該成功載入聊天室歷史訊息', async () => {
            const mockMessages = [
                { id: 1, content: '訊息1' },
                { id: 2, content: '訊息2' }
            ];
            loadChatroomMessages.mockResolvedValue(mockMessages);

            const chatroomId = 'chatroom123';
            const result = await loadChatroomHistoryService(chatroomId);

            expect(loadChatroomMessages).toHaveBeenCalledWith(chatroomId);
            expect(result).toEqual({
                success: true,
                content: mockMessages
            });
        });

        it('應該處理載入歷史訊息失敗的情況', async () => {
            const errorMessage = '載入失敗';
            loadChatroomMessages.mockRejectedValue(new Error(errorMessage));

            const result = await loadChatroomHistoryService('chatroom123');

            expect(result).toEqual({
                success: false,
                error: errorMessage
            });
        });
    });

    describe('loadTextMessagesService', () => {
        it('應該成功載入文字訊息', async () => {
            const mockMessages = [{ id: 1, type: 'text', content: '文字訊息' }];
            loadChatroomTextMessages.mockResolvedValue(mockMessages);

            const result = await loadTextMessagesService('chatroom123');

            expect(loadChatroomTextMessages).toHaveBeenCalledWith('chatroom123');
            expect(result).toEqual({
                success: true,
                content: mockMessages
            });
        });
    });

    describe('loadDrawingMessagesService', () => {
        it('應該成功載入繪圖訊息', async () => {
            const mockMessages = [{ id: 1, type: 'drawing', content: '繪圖資料' }];
            loadChatroomDrawingMessages.mockResolvedValue(mockMessages);

            const result = await loadDrawingMessagesService('chatroom123');

            expect(loadChatroomDrawingMessages).toHaveBeenCalledWith('chatroom123');
            expect(result).toEqual({
                success: true,
                content: mockMessages
            });
        });
    });

    describe('loadUserMessagesService', () => {
        it('應該成功載入使用者訊息', async () => {
            const mockMessages = [{ id: 1, sender: 'user', content: '使用者訊息' }];
            loadUserMessages.mockResolvedValue(mockMessages);

            const result = await loadUserMessagesService('chatroom123');

            expect(loadUserMessages).toHaveBeenCalledWith('chatroom123');
            expect(result).toEqual({
                success: true,
                content: mockMessages
            });
        });
    });

    describe('loadAIMessagesService', () => {
        it('應該成功載入AI訊息', async () => {
            const mockMessages = [{ id: 1, sender: 'ai', content: 'AI回應' }];
            loadAIMessages.mockResolvedValue(mockMessages);

            const result = await loadAIMessagesService('chatroom123');

            expect(loadAIMessages).toHaveBeenCalledWith('chatroom123');
            expect(result).toEqual({
                success: true,
                content: mockMessages
            });
        });
    });

    describe('handleServiceCall error scenarios', () => {
        it('應該處理沒有content屬性的回應', async () => {
            const mockResponse = 'simple response';
            sendMessage.mockResolvedValue(mockResponse);

            const payload = { text: '測試', conversationCount: 1, hasDefaultQuestion: false };
            const result = await sendTextToBackend(payload, 'chatroom123');

            expect(result).toEqual({
                success: true,
                content: mockResponse
            });
        });

        it('應該處理具有content屬性的回應', async () => {
            const mockResponse = { content: '有content的回應', other: 'data' };
            sendMessage.mockResolvedValue(mockResponse);

            const payload = { text: '測試', conversationCount: 1, hasDefaultQuestion: false };
            const result = await sendTextToBackend(payload, 'chatroom123');

            expect(result).toEqual({
                success: true,
                content: '有content的回應'
            });
        });
    });

    describe('edge cases', () => {
        it('sendCanvasAnalysisToBackend 應該處理空字串訊息', async () => {
            const mockResponse = { content: '分析結果' };
            analysisImage.mockResolvedValue(mockResponse);

            await sendCanvasAnalysisToBackend('', 'canvasData', 'chatroom123');

            expect(analysisImage).toHaveBeenCalledWith('請分析這張圖片', 'canvasData', 'chatroom123');
        });

        it('sendAIDrawingToBackend 應該處理空字串訊息', async () => {
            const mockResponse = { content: '繪圖結果' };
            callAIDrawingAPI.mockResolvedValue(mockResponse);

            await sendAIDrawingToBackend('', 'canvasData', 'chatroom123');

            expect(callAIDrawingAPI).toHaveBeenCalledWith(
                '請根據這張圖片生成新的內容',
                'canvasData',
                true,
                'chatroom123'
            );
        });
    });
});