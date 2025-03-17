import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatRoom from './chatRoom';
import ChatService from './chatService';

// 模擬 ChatService
jest.mock('./chatService', () => ({
  getChatHistory: jest.fn(),
  sendMessage: jest.fn(),
  sendImage: jest.fn()
}));

describe('ChatRoom 組件測試', () => {
  beforeEach(() => {
    // 重置所有模擬函數
    jest.clearAllMocks();
  });

  test('應該正確渲染 ChatRoom 組件', () => {
    // 模擬 getChatHistory 回傳空陣列
    ChatService.getChatHistory.mockResolvedValue([]);
    
    render(<ChatRoom />);
    
    // 確認載入中的訊息出現
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  test('應該載入聊天歷史', async () => {
    // 模擬聊天歷史資料
    const mockHistory = [
      { content: '你好', isUser: true },
      { content: '您好，有什麼我可以幫您的嗎？', isUser: false }
    ];
    
    ChatService.getChatHistory.mockResolvedValue(mockHistory);
    
    render(<ChatRoom />);
    
    // 等待歷史訊息載入
    await waitFor(() => {
      expect(screen.getByText('你好')).toBeInTheDocument();
      expect(screen.getByText('您好，有什麼我可以幫您的嗎？')).toBeInTheDocument();
    });
  });

  test('應該能夠發送訊息', async () => {
    // 模擬發送訊息的回應
    ChatService.getChatHistory.mockResolvedValue([]);
    ChatService.sendMessage.mockResolvedValue({
      content: '這是 AI 的回應',
      isUser: false,
      isImage: false
    });
    
    render(<ChatRoom />);
    
    // 等待組件初始化完成
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    // 模擬輸入訊息
    // 注意：這裡需要找到 TextInputArea 中的輸入欄位
    // 假設有一個輸入欄位有 placeholder="輸入訊息..."
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    fireEvent.change(inputElement, { target: { value: '測試訊息' } });
    
    // 模擬按下發送按鈕
    // 假設有一個按鈕包含文字"輸入"
    const sendButton = screen.getByText('輸入');
    fireEvent.click(sendButton);
    
    // 確認訊息已發送
    await waitFor(() => {
      expect(ChatService.sendMessage).toHaveBeenCalledWith('測試訊息');
      expect(screen.getByText('測試訊息')).toBeInTheDocument();
      expect(screen.getByText('這是 AI 的回應')).toBeInTheDocument();
    });
  });

  test('應該能夠處理圖片上傳', async () => {
    // 模擬圖片上傳的回應
    ChatService.getChatHistory.mockResolvedValue([]);
    ChatService.sendImage.mockResolvedValue({
      content: '我收到了您的圖片',
      isUser: false,
      isImage: false
    });
    
    render(<ChatRoom />);
    
    // 等待組件初始化完成
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    // 模擬文件選擇
    // 創建一個假的圖片文件
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    
    // 獲取文件輸入元素 (通常是隱藏的)
    // 這裡需要使用 querySelector 或其他方法來獲取隱藏的輸入元素
    const fileInput = document.querySelector('input[type="file"]');
    
    // 模擬 FileReader 的行為
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,dummyImageData'
    };
    
    global.FileReader = jest.fn(() => mockFileReader);
    
    // 模擬文件選擇事件
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // 模擬 FileReader 完成讀取
    mockFileReader.onload({ target: mockFileReader });
    
    // 確認圖片已上傳
    await waitFor(() => {
      expect(ChatService.sendImage).toHaveBeenCalledWith(file, '');
      expect(screen.getByText('我收到了您的圖片')).toBeInTheDocument();
    });
  });

  test('應該處理載入聊天歷史時的錯誤', async () => {
    // 模擬 getChatHistory 拋出錯誤
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    ChatService.getChatHistory.mockRejectedValue(new Error('載入失敗'));
    
    render(<ChatRoom />);
    
    // 等待錯誤處理完成
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('載入聊天歷史錯誤:', expect.any(Error));
    });
    
    // 清理 spy
    consoleErrorSpy.mockRestore();
  });

  test('當訊息為空時不應該發送', async () => {
    // 模擬 getChatHistory 回傳空陣列
    ChatService.getChatHistory.mockResolvedValue([]);
    
    render(<ChatRoom />);
    
    // 等待組件初始化完成
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    // 模擬輸入空訊息
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    fireEvent.change(inputElement, { target: { value: '' } });
    
    // 模擬按下發送按鈕
    const sendButton = screen.getByText('輸入');
    fireEvent.click(sendButton);
    
    // 確認沒有發送訊息
    expect(ChatService.sendMessage).not.toHaveBeenCalled();
  });
});