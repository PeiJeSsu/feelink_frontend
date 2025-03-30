import { ChatService } from '../ChatRoom/ChatService';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('ChatService', () => {
    let chatService;

    beforeEach(() => {
        axios.get.mockClear();
        axios.post.mockClear();
        chatService = new ChatService('user-123456789'); // 測試時固定 sessionId
    });

    test('應該生成固定的 sessionId', () => {
        expect(chatService.sessionId).toBe('user-123456789');
    });

    test('sendMessage 應該發送 POST 請求並返回回應', async () => {
        const mockResponse = { data: { content: '機器人回覆' } };
        axios.post.mockResolvedValueOnce(mockResponse);

        const result = await chatService.sendMessage('Hello');

        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:8080/chat',
            expect.any(FormData)
        );

        expect(result).toEqual({
            content: '機器人回覆',
            isUser: false,
            isImage: false
        });
    });

    test('getChatHistory 應該發送 GET 請求並返回回應', async () => {
        const mockResponse = { data: [{ message: '歷史訊息' }] };
        axios.get.mockResolvedValueOnce(mockResponse);
    
        const result = await chatService.getChatHistory();
    
        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:8080/history/user-123456789'
        );
    
        expect(result).toEqual([{ message: '歷史訊息' }]);
    });
    
    test('getLatestResponse 應該處理 204 回應', async () => {
        const mockError = {
            response: {
                status: 204
            }
        };
        axios.get.mockRejectedValueOnce(mockError);

        const result = await chatService.getLatestResponse();

        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:8080/latest-response/user-123456789'
        );

        expect(result).toBeNull();
    });

    test('getLatestResponse 應該處理正常回應', async () => {
        const mockResponse = { 
            status: 200,
            data: { content: '最新回覆' } 
        };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await chatService.getLatestResponse();

        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:8080/latest-response/user-123456789'
        );

        expect(result).toEqual({ content: '最新回覆' });
    });

    test('sendImage 應該發送 POST 請求並返回回應', async () => {
        const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const mockResponse = { data: { success: true } };

        axios.post.mockResolvedValueOnce(mockResponse);

        const result = await chatService.sendImage(mockFile, '這是一張測試圖片');

        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:8080/chat',
            expect.any(FormData)
        );

        expect(result).toEqual({ success: true });
    });

    test('callApi 應該發送 POST 請求並返回回應', async () => {
        const mockResponse = { data: { reply: '這是 API 回應' } };
        const message = '測試 API 訊息';

        axios.post.mockResolvedValueOnce(mockResponse);

        const result = await chatService.callApi(message);

        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:8080/api-message',
            null,
            {
                params: {
                    message: message,
                    sessionId: 'user-123456789'
                }
            }
        );

        expect(result).toEqual({ reply: '這是 API 回應' });
    });
});