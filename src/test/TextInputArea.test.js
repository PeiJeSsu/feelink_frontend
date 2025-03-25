const React = require('react');
const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');
require('@testing-library/jest-dom');
const ChatRoom = require('../ChatRoom/chatRoom').default;
const ChatService = require('../ChatRoom/chatService');
const TextInputArea = require('../ChatRoom/textInputArea').default;

// 模擬 ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // 模擬觸發回調
    setTimeout(() => this.callback(), 0);
  }
  unobserve() {}
  disconnect() {}
}




jest.mock('../ChatRoom/chatService', () => ({
  getChatHistory: jest.fn(),
  sendMessage: jest.fn(),
  sendImage: jest.fn()
}));

describe('TextInputArea 組件測試', () => {
  test('應該正確渲染並處理 onHeightChange', async () => {
    const mockOnHeightChange = jest.fn();
    
    await act(async () => {
      render(<TextInputArea onSendMessage={jest.fn()} onUploadImage={jest.fn()} onHeightChange={mockOnHeightChange} />);
    });
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    
    // 設置元素屬性以模擬多行文本
    const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 60
    });
    
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '測試訊息\n換行' } });
    });
    
    // 等待 ResizeObserver 模擬觸發
    await waitFor(() => {
      expect(mockOnHeightChange).toHaveBeenCalled();
    });
    
    // 恢復原始定義
    if (originalScrollHeight) {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight);
    } else {
      delete Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
    }
  });

  test('應該處理按鍵事件正確', async () => {
    const mockSendMessage = jest.fn();
    
    await act(async () => {
      render(<TextInputArea onSendMessage={mockSendMessage} onUploadImage={jest.fn()} />);
    });
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    
    // 測試普通 Enter 鍵發送消息
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'Hello' } });
    });
    
    await act(async () => {
      fireEvent.keyDown(inputElement, { key: 'Enter', preventDefault: () => {} });
    });
    
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    
    // 由於發送後輸入框會被清空，所以需要再次設置值
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '測試換行' } });
    });
    
    // 測試 Shift+Enter 不會發送消息
    await act(async () => {
      fireEvent.keyDown(inputElement, { key: 'Enter', shiftKey: true, preventDefault: () => {} });
    });
    
    // mockSendMessage 調用次數應該仍為 1（只有第一次調用）
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    // 輸入框不應該被清空
    expect(inputElement).toHaveValue('測試換行');
  });
});