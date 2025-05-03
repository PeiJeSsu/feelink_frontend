import { renderHook, act } from '@testing-library/react';
import useChatMessages from '../hooks/UseChatMessages'; 
import { 
  handleSendTextMessage, 
  handleSendImageMessage, 
  handleSendCanvasAnalysis, 
  handleSendAIDrawing 
} from '../helpers/HandleSendMessage'; 

// Mock HandleSendMessage 中的所有函數
jest.mock('../helpers/HandleSendMessage', () => ({
  handleSendTextMessage: jest.fn(),
  handleSendImageMessage: jest.fn(),
  handleSendCanvasAnalysis: jest.fn(),
  handleSendAIDrawing: jest.fn()
}));

describe('useChatMessages Hook', () => {
  // 每個測試前重置模擬函數
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 測試初始狀態
  it('應該返回正確的初始狀態', () => {
    const { result } = renderHook(() => useChatMessages(null));

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.predefinedQuestions.length).toBe(3);
    expect(typeof result.current.sendTextMessage).toBe('function');
    expect(typeof result.current.sendImageMessage).toBe('function');
    expect(typeof result.current.sendCanvasAnalysis).toBe('function');
    expect(typeof result.current.sendAIDrawing).toBe('function');
    expect(typeof result.current.addSystemMessage).toBe('function');
  });

  // 測試 sendTextMessage 函數
  it('sendTextMessage 應該增加 conversationCount 並調用 handleSendTextMessage', () => {
    const { result } = renderHook(() => useChatMessages(null));
    
    act(() => {
      result.current.sendTextMessage('Hello');
    });

    expect(handleSendTextMessage).toHaveBeenCalledWith(
      'Hello',
      [],
      expect.any(Function),
      expect.any(Function),
      '',
      1
    );
  });

  // 測試 sendImageMessage 函數
  it('sendImageMessage 應該調用 handleSendImageMessage', () => {
    const { result } = renderHook(() => useChatMessages(null));
    const testImage = new Blob(['test image data'], { type: 'image/png' });
    
    act(() => {
      result.current.sendImageMessage('Image description', testImage);
    });

    expect(handleSendImageMessage).toHaveBeenCalledWith(
      'Image description',
      testImage,
      [],
      expect.any(Function),
      expect.any(Function)
    );
  });

  // 測試 addSystemMessage 函數
  it('addSystemMessage 應該添加系統訊息並更新 currentQuestion', () => {
    const { result } = renderHook(() => useChatMessages(null));
    
    act(() => {
      result.current.addSystemMessage('System message');
    });

    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].message).toBe('System message');
    expect(result.current.messages[0].isUser).toBe(false);
  });

  // 測試 sendCanvasAnalysis 函數
  it('sendCanvasAnalysis 應該提取 canvas 數據並調用 handleSendCanvasAnalysis', async () => {
    // 創建模擬的 canvas
    const mockCanvas = {
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test-data')
    };
    
    // 模擬 fetch 和 blob
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue('mocked-blob')
    });
    
    const { result } = renderHook(() => useChatMessages(mockCanvas));
    
    await act(async () => {
      await result.current.sendCanvasAnalysis('Analyze this');
    });

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,test-data');
    expect(handleSendCanvasAnalysis).toHaveBeenCalledWith(
      'mocked-blob',
      'Analyze this',
      [],
      expect.any(Function),
      expect.any(Function)
    );
  });

  // 測試 sendAIDrawing 函數
  it('sendAIDrawing 應該提取 canvas 數據並調用 handleSendAIDrawing', async () => {
    // 創建模擬的 canvas
    const mockCanvas = {
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test-data')
    };
    
    // 模擬 fetch 和 blob
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue('mocked-blob')
    });
    
    const { result } = renderHook(() => useChatMessages(mockCanvas));
    
    await act(async () => {
      await result.current.sendAIDrawing('Draw this');
    });

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,test-data');
    expect(handleSendAIDrawing).toHaveBeenCalledWith(
      'mocked-blob',
      'Draw this',
      [],
      expect.any(Function),
      expect.any(Function),
      mockCanvas
    );
  });

  // 測試沒有 canvas 的情況
  it('當 canvas 不可用時，sendCanvasAnalysis 應該提前返回', async () => {
    // 模擬 console.error
    console.error = jest.fn();
    
    const { result } = renderHook(() => useChatMessages(null));
    
    await act(async () => {
      await result.current.sendCanvasAnalysis('Analyze without canvas');
    });

    expect(console.error).toHaveBeenCalledWith('沒有可用的畫布');
    expect(handleSendCanvasAnalysis).not.toHaveBeenCalled();
  });

  it('當 canvas 不可用時，sendAIDrawing 應該提前返回', async () => {
    // 模擬 console.error
    console.error = jest.fn();
    
    const { result } = renderHook(() => useChatMessages(null));
    
    await act(async () => {
      await result.current.sendAIDrawing('Draw without canvas');
    });

    expect(console.error).toHaveBeenCalledWith('沒有可用的畫布');
    expect(handleSendAIDrawing).not.toHaveBeenCalled();
  });
});