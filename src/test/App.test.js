import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatRoom from '../ChatRoom/ChatRoom';
import ChatService from '../ChatRoom/ChatService';


jest.mock('../ChatRoom/ChatService', () => ({
  getChatHistory: jest.fn(),
  sendMessage: jest.fn(),
  sendImage: jest.fn()
}));

describe('ChatRoom 組件測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('應該正確渲染 ChatRoom 組件', async () => {
    ChatService.getChatHistory.mockResolvedValue([]);
    
    render(<ChatRoom />);
    
    expect(screen.getByText('載入中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
  });

  test('應該載入聊天歷史', async () => {
    const mockHistory = [
      { content: '你好', isUser: true },
      { content: '您好，有什麼我可以幫您的嗎？', isUser: false }
    ];
    
    ChatService.getChatHistory.mockResolvedValue(mockHistory);
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(screen.getByText('你好')).toBeInTheDocument();
      expect(screen.getByText('您好，有什麼我可以幫您的嗎？')).toBeInTheDocument();
    });
  });

  test('當歷史為空陣列時應該正確處理', async () => {
    ChatService.getChatHistory.mockResolvedValue([]);
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    

    await waitFor(() => {
      expect(screen.queryByText('載入中...')).not.toBeInTheDocument();
    });
  });

  test('應該能夠發送訊息', async () => {
    ChatService.getChatHistory.mockResolvedValue([]);
    ChatService.sendMessage.mockResolvedValue({
      content: '這是 AI 的回應',
      isUser: false,
      isImage: false
    });
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '測試訊息' } });
    });
    
    const sendButton = screen.getByTestId('InputIcon').closest('button');
    
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(ChatService.sendMessage).toHaveBeenCalledWith('測試訊息');
      expect(screen.getByText('測試訊息')).toBeInTheDocument();
      expect(screen.getByText('這是 AI 的回應')).toBeInTheDocument();
    });
  });

  test('發送訊息時發生錯誤應該正確處理', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    ChatService.getChatHistory.mockResolvedValue([]);
    ChatService.sendMessage.mockRejectedValue(new Error('發送失敗'));
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '測試訊息' } });
    });
    
    const sendButton = screen.getByTestId('InputIcon').closest('button');
    
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('發送訊息錯誤:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('應該能夠處理圖片上傳', async () => {
    ChatService.getChatHistory.mockResolvedValue([]);
    ChatService.sendImage.mockResolvedValue({
      content: '我收到了您的圖片',
      isUser: false,
      isImage: false
    });
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    
    const fileInput = document.querySelector('input[type="file"]');
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,dummyImageData'
    };
    
    global.FileReader = jest.fn(() => mockFileReader);
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      mockFileReader.onload({ target: mockFileReader });
    });
    
    await waitFor(() => {
      expect(ChatService.sendImage).toHaveBeenCalledWith(file, '');
      expect(screen.getByText('我收到了您的圖片')).toBeInTheDocument();
    });
  });

  test('應該能夠處理圖片和文字一起上傳', async () => {
    ChatService.getChatHistory.mockResolvedValue([]);
    ChatService.sendImage.mockResolvedValue({
      content: '我收到了您的圖片和文字',
      isUser: false,
      isImage: false
    });
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    

    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '這是圖片說明' } });
    });
    
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,dummyImageData'
    };
    
    global.FileReader = jest.fn(() => mockFileReader);
    

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      mockFileReader.onload({ target: mockFileReader });
    });
    
    await waitFor(() => {
      expect(ChatService.sendImage).toHaveBeenCalledWith(file, '這是圖片說明');
      expect(screen.getByText('這是圖片說明')).toBeInTheDocument();
      expect(screen.getByText('我收到了您的圖片和文字')).toBeInTheDocument();
    });
  });

  test('上傳圖片發生錯誤應該正確處理', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    ChatService.getChatHistory.mockResolvedValue([]);
    ChatService.sendImage.mockRejectedValue(new Error('上傳圖片失敗'));
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,dummyImageData'
    };
    
    global.FileReader = jest.fn(() => mockFileReader);
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      mockFileReader.onload({ target: mockFileReader });
    });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('上傳圖片錯誤:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('應該處理載入聊天歷史時的錯誤', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    ChatService.getChatHistory.mockRejectedValue(new Error('載入失敗'));
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('載入聊天歷史錯誤:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('當訊息為空時不應該發送', async () => {
    ChatService.getChatHistory.mockResolvedValue([]);
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '' } });
    });
    
    const sendButton = screen.getByTestId('InputIcon').closest('button');
    
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    expect(ChatService.sendMessage).not.toHaveBeenCalled();
  });
  
  test('應該正確處理輸入區域高度變化', async () => {
    ChatService.getChatHistory.mockResolvedValue([]);
    
    render(<ChatRoom />);
    
    await waitFor(() => {
      expect(ChatService.getChatHistory).toHaveBeenCalled();
    });
    

    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    

    const longText = '第一行\n第二行\n第三行\n第四行';
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: longText } });
    });
    
    expect(inputElement.value).toBe(longText);
  });
});