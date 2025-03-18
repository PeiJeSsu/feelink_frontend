import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatRoom from '../ChatRoom/chatRoom';
import ChatService from '../ChatRoom/chatService';
import TextInputArea from '../ChatRoom/textInputArea';

jest.mock('../ChatRoom/chatService', () => ({
  getChatHistory: jest.fn(),
  sendMessage: jest.fn(),
  sendImage: jest.fn()
}));

describe('TextInputArea 組件測試', () => {
  test('應該正確渲染並處理 onHeightChange', async () => {
    const mockOnHeightChange = jest.fn();
    render(<TextInputArea onHeightChange={mockOnHeightChange} />);
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    fireEvent.change(inputElement, { target: { value: '測試訊息\n換行' } });
    
    await waitFor(() => {
      expect(mockOnHeightChange).toHaveBeenCalledWith(2);
    });
  });



  test('應該在按下 Enter (無 Shift) 時發送訊息', async () => {
    const mockSendMessage = jest.fn();
    render(<TextInputArea onSendMessage={mockSendMessage} />);
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    fireEvent.change(inputElement, { target: { value: 'Hello' } });
    fireEvent.keyPress(inputElement, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    });
  });

  test('應該在按下 Shift+Enter 時不發送訊息', async () => {
    const mockSendMessage = jest.fn();
    render(<TextInputArea onSendMessage={mockSendMessage} />);
    
    const inputElement = screen.getByPlaceholderText('輸入訊息...');
    fireEvent.change(inputElement, { target: { value: 'Hello' } });
    fireEvent.keyPress(inputElement, { key: 'Enter', shiftKey: true });
    
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  
});
