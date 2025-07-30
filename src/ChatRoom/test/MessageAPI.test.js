import { sendMessage, callAIDrawingAPI } from '../helpers/MessageAPI'; // 調整路徑
import { apiConfig } from '../config/ApiConfig';


jest.mock('../config/ApiConfig', () => ({
  apiConfig: {
    post: jest.fn()
  }
}));


Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn()
  }
});

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.crypto.randomUUID.mockReturnValue('test-uuid-123');
  });

  describe('sendMessage', () => {
    const mockResponse = {
      data: {
        content: 'Test response content'
      }
    };

    beforeEach(() => {
      apiConfig.post.mockResolvedValue(mockResponse);
    });

    it('should send message with text only', async () => {
      const text = 'Hello world';
      
      const result = await sendMessage(text);
      
      expect(apiConfig.post).toHaveBeenCalledWith('/chat', expect.any(FormData));
      expect(result).toEqual({ content: 'Test response content' });
      
      const formData = apiConfig.post.mock.calls[0][1];
      expect(formData.get('userMessage')).toBe(text);
      expect(formData.get('sessionId')).toBe('test-uuid-123');
    });

    it('should send message with conversation count and default question flag', async () => {
      const text = 'Hello world';
      const conversationCount = 5;
      const hasDefaultQuestion = true;
      
      await sendMessage(text, conversationCount, hasDefaultQuestion);
      
      const formData = apiConfig.post.mock.calls[0][1];
      expect(formData.get('conversationCount')).toBe('5');
      expect(formData.get('hasDefaultQuestion')).toBe('true');
    });

    it('should use provided sessionId instead of generating new one', async () => {
      const text = 'Hello world';
      const conversationCount = null;
      const hasDefaultQuestion = false;
      const customSessionId = 'custom-session-123';
      
      await sendMessage(text, conversationCount, hasDefaultQuestion, customSessionId);
      
      const formData = apiConfig.post.mock.calls[0][1];
      expect(formData.get('sessionId')).toBe(customSessionId);
    });

    it('should not append conversationCount when it is null', async () => {
      const text = 'Hello world';
      
      await sendMessage(text, null);
      
      const formData = apiConfig.post.mock.calls[0][1];
      expect(formData.get('conversationCount')).toBeNull();
      expect(formData.get('hasDefaultQuestion')).toBeNull();
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      apiConfig.post.mockRejectedValue(error);
      
      const text = 'Hello world';
      
      await expect(sendMessage(text)).rejects.toThrow('API Error');
    });

    it('should generate unique session ID for each call', async () => {
      global.crypto.randomUUID
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2');
      
      const text = 'Hello world';
      
      await sendMessage(text);
      await sendMessage(text);
      
      const firstCall = apiConfig.post.mock.calls[0][1];
      const secondCall = apiConfig.post.mock.calls[1][1];
      
      expect(firstCall.get('sessionId')).toBe('uuid-1');
      expect(secondCall.get('sessionId')).toBe('uuid-2');
    });
  });

  describe('callAIDrawingAPI', () => {
    const mockSuccessResponse = {
      data: {
        success: true,
        content: 'Generated image data'
      }
    };

    beforeEach(() => {
      apiConfig.post.mockResolvedValue(mockSuccessResponse);
    });

    it('should call AI drawing API with correct parameters', async () => {
      const messageText = 'Draw a cat';
      const canvasData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = await callAIDrawingAPI(messageText, canvasData);
      
      expect(apiConfig.post).toHaveBeenCalledWith(
        '/generate',
        {
          text: messageText,
          imageData: canvasData,
          removeBackground: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      expect(result).toBe('Generated image data');
    });

    it('should handle successful response', async () => {
      const messageText = 'Draw a dog';
      const canvasData = 'canvas-data';
      
      const result = await callAIDrawingAPI(messageText, canvasData);
      
      expect(result).toBe('Generated image data');
    });

    it('should throw error when response data is missing', async () => {
      apiConfig.post.mockResolvedValue({});
      
      const messageText = 'Draw a cat';
      const canvasData = 'canvas-data';
      
      await expect(callAIDrawingAPI(messageText, canvasData))
        .rejects.toThrow('AI 畫圖失敗');
    });

    it('should throw error when success is false', async () => {
      apiConfig.post.mockResolvedValue({
        data: {
          success: false,
          error: 'Custom error message'
        }
      });
      
      const messageText = 'Draw a cat';
      const canvasData = 'canvas-data';
      
      await expect(callAIDrawingAPI(messageText, canvasData))
        .rejects.toThrow('Custom error message');
    });

    it('should throw default error when success is false without error message', async () => {
      apiConfig.post.mockResolvedValue({
        data: {
          success: false
        }
      });
      
      const messageText = 'Draw a cat';
      const canvasData = 'canvas-data';
      
      await expect(callAIDrawingAPI(messageText, canvasData))
        .rejects.toThrow('AI 畫圖失敗');
    });

    it('should handle API network errors', async () => {
      const networkError = new Error('Network Error');
      apiConfig.post.mockRejectedValue(networkError);
      
      const messageText = 'Draw a cat';
      const canvasData = 'canvas-data';
      
      await expect(callAIDrawingAPI(messageText, canvasData))
        .rejects.toThrow('Network Error');
    });

    it('should handle malformed response data', async () => {
      apiConfig.post.mockResolvedValue({
        data: null
      });
      
      const messageText = 'Draw a cat';
      const canvasData = 'canvas-data';
      
      await expect(callAIDrawingAPI(messageText, canvasData))
        .rejects.toThrow('AI 畫圖失敗');
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple API calls independently', async () => {
      // Mock different responses for different endpoints
      apiConfig.post
        .mockResolvedValueOnce({ data: { content: 'Chat response' } })
        .mockResolvedValueOnce({ data: { success: true, content: 'Drawing response' } });
      
      const text = 'Hello';
      const canvasData = 'canvas-data';
      
      const [chatResult, drawingResult] = await Promise.all([
        sendMessage(text),
        callAIDrawingAPI('Draw something', canvasData)
      ]);
      
      expect(chatResult).toEqual({ content: 'Chat response' });
      expect(drawingResult).toBe('Drawing response');
      expect(apiConfig.post).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Utility Functions', () => {
  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      global.crypto.randomUUID
        .mockReturnValueOnce('id-1')
        .mockReturnValueOnce('id-2');
      
      const text = 'test';
      
      apiConfig.post.mockResolvedValue({ data: { content: 'response' } });
      
      sendMessage(text);
      sendMessage(text);
      
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(2);
    });
  });
});