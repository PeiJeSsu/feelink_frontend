import { ChatService } from '../ChatRoom/chatService';

// Mock fetch
global.fetch = jest.fn();

describe('ChatService', () => {
    let chatService;

    beforeEach(() => {
        fetch.mockClear(); // 清除 mock
        chatService = new ChatService('user-123456789'); // 測試時固定 sessionId
    });

    test('應該生成固定的 sessionId', () => {
        expect(chatService.sessionId).toBe('user-123456789');
    });

    test('sendMessage 應該發送 POST 請求並返回回應', async () => {
        const mockResponse = { content: '機器人回覆' };
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await chatService.sendMessage('Hello');

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/chat'),
            expect.objectContaining({ method: 'POST' })
        );

        expect(result).toEqual({
            content: '機器人回覆',
            isUser: false,
            isImage: false
        });
    });

    test('getChatHistory 應該發送 GET 請求並返回回應', async () => {
        const mockResponse = [{ message: '歷史訊息' }];
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(mockResponse)
        });
    
        const result = await chatService.getChatHistory();
    
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8080/history/user-123456789',
            expect.objectContaining({ method: 'GET' }) // 確保有 method: 'GET'
        );
    
        expect(result).toEqual([{ message: '歷史訊息' }]);
    });
    
    test('getLatestResponse 應該處理 204 回應', async () => {
        fetch.mockResolvedValueOnce({ status: 204 });

        const result = await chatService.getLatestResponse();

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8080/latest-response/user-123456789',
            expect.objectContaining({ method: 'GET' })
        );

        expect(result).toBeNull();
    });

    test('getLatestResponse 應該處理正常回應', async () => {
        const mockResponse = { content: '最新回覆' };
        fetch.mockResolvedValueOnce({
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse)
        });

        const result = await chatService.getLatestResponse();

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8080/latest-response/user-123456789',
            expect.objectContaining({ method: 'GET' })
        );

        expect(result).toEqual({ content: '最新回覆' });
    });

    test('sendImage 應該發送 POST 請求並返回回應', async () => {
        const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const mockResponse = { success: true };

        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await chatService.sendImage(mockFile, '這是一張測試圖片');

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8080/chat',
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            })
        );

        expect(result).toEqual(mockResponse);
    });

    test('callApi 應該發送 POST 請求並返回回應', async () => {
        const mockResponse = { reply: '這是 API 回應' };
        const message = '測試 API 訊息';

        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await chatService.callApi(message);

        expect(fetch).toHaveBeenCalledWith(
            `http://localhost:8080/api-message?message=${encodeURIComponent(message)}&sessionId=user-123456789`,
            expect.objectContaining({ method: 'POST' })
        );

        expect(result).toEqual(mockResponse);
    });
});
