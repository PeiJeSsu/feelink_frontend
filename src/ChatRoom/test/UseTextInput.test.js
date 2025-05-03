import { renderHook, act } from '@testing-library/react';
import { useTextInput } from '../hooks/UseTextInput'; 
import {
  handleSendText,
  handleSendImage,
  handleMessageChange,
  handleImageChange,
  handleAnalyzeCanvas,
  handleAIDrawing
} from "../helpers/HandleTextInput"; 

// Mock HandleTextInput 中的所有函數
jest.mock('../helpers/HandleTextInput', () => ({
  handleSendText: jest.fn(),
  handleSendImage: jest.fn(),
  handleMessageChange: jest.fn(),
  handleImageChange: jest.fn(),
  handleAnalyzeCanvas: jest.fn(),
  handleAIDrawing: jest.fn()
}));

describe('useTextInput Hook', () => {
  // 測試前準備 mock 函數
  const mockOnSendMessage = jest.fn();
  const mockOnUploadImage = jest.fn();
  const mockOnAnalyzeCanvas = jest.fn();
  const mockOnAIDrawing = jest.fn();
  const mockDisabled = false;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 測試初始狀態
  it('應該返回正確的初始狀態', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    expect(result.current.message).toBe('');
    expect(result.current.textInputRef).not.toBeNull();
    expect(result.current.imageInputRef).not.toBeNull();
    expect(typeof result.current.sendText).toBe('function');
    expect(typeof result.current.sendImage).toBe('function');
    expect(typeof result.current.messageChange).toBe('function');
    expect(typeof result.current.imageChange).toBe('function');
    expect(typeof result.current.setMessage).toBe('function');
    expect(typeof result.current.handleAnalyzeCanvas).toBe('function');
    expect(typeof result.current.handleAIDrawing).toBe('function');
  });

  // 測試 sendText 函數
  it('sendText 應該調用 handleSendText', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    act(() => {
      result.current.sendText();
    });

    expect(handleSendText).toHaveBeenCalledWith(
      '',
      expect.any(Function),
      mockOnSendMessage,
      mockDisabled
    );
  });

  // 測試 sendImage 函數
  it('sendImage 應該調用 handleSendImage', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    act(() => {
      result.current.sendImage();
    });

    expect(handleSendImage).toHaveBeenCalledWith(result.current.imageInputRef);
  });

  // 測試 messageChange 函數
  it('messageChange 應該調用 handleMessageChange', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    const mockEvent = { target: { value: 'test message' } };

    act(() => {
      result.current.messageChange(mockEvent);
    });

    expect(handleMessageChange).toHaveBeenCalledWith(
      mockEvent,
      expect.any(Function)
    );
  });

  // 測試 imageChange 函數
  it('imageChange 應該調用 handleImageChange', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    const mockEvent = { target: { files: [new Blob()] } };

    act(() => {
      result.current.imageChange(mockEvent);
    });

    expect(handleImageChange).toHaveBeenCalledWith(
      mockEvent,
      '',
      expect.any(Function),
      mockOnUploadImage
    );
  });

  // 測試 analyzeCanvas 函數
  it('analyzeCanvas 應該調用 handleAnalyzeCanvas', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    act(() => {
      result.current.handleAnalyzeCanvas();
    });

    expect(handleAnalyzeCanvas).toHaveBeenCalledWith(
      '',
      expect.any(Function),
      mockOnAnalyzeCanvas
    );
  });

  // 測試 aiDrawing 函數
  it('aiDrawing 應該調用 handleAIDrawing', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    act(() => {
      result.current.handleAIDrawing();
    });

    expect(handleAIDrawing).toHaveBeenCalledWith(
      '',
      expect.any(Function),
      mockOnAIDrawing
    );
  });

  // 當 message 狀態變更時的測試
  it('setMessage 應該更新 message 狀態', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      mockDisabled
    ));

    act(() => {
      result.current.setMessage('New message');
    });

    expect(result.current.message).toBe('New message');
  });

  // 測試 disabled 狀態下的行為
  it('當 disabled 為 true 時，sendText 應該傳遞 disabled 狀態', () => {
    const { result } = renderHook(() => useTextInput(
      mockOnSendMessage,
      mockOnUploadImage,
      mockOnAnalyzeCanvas,
      mockOnAIDrawing,
      true // disabled 為 true
    ));

    act(() => {
      result.current.sendText();
    });

    expect(handleSendText).toHaveBeenCalledWith(
      '',
      expect.any(Function),
      mockOnSendMessage,
      true
    );
  });
});