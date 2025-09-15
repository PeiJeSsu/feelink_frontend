import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the UseChatMessages hook first
jest.mock('../hooks/UseChatMessages', () => jest.fn());

// Mock the apiConfig
jest.mock('../config/ApiConfig', () => ({
  apiConfig: {
    delete: jest.fn(),
  },
}));

// Mock child components
jest.mock('../components/ChatMessage', () => {
  return function MockChatMessage({ message, isUser, timestamp }) {
    return (
      <div data-testid="chat-message">
        <span>{isUser ? 'User' : 'AI'}: {message}</span>
        <span>{timestamp}</span>
      </div>
    );
  };
});

jest.mock('../components/TextInputArea', () => {
  return function MockTextInputArea({ onSendMessage, disabled }) {
    return (
      <div data-testid="text-input-area">
        <button 
          onClick={() => onSendMessage('test message')}
          disabled={disabled}
          data-testid="send-button"
        >
          Send
        </button>
      </div>
    );
  };
});

// Import the component after setting up mocks
import ChatRoom from '../components/ChatRoom';
import useChatMessages from '../hooks/UseChatMessages';
import { apiConfig } from '../config/ApiConfig';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ChatRoom Component', () => {
  const mockCanvas = { width: 800, height: 600 };
  const defaultMockReturn = {
    messages: [],
    loading: false,
    disabled: false,
    historyLoading: false,
    historyLoaded: false,
    sendTextMessage: jest.fn(),
    sendImageMessage: jest.fn(),
    sendCanvasAnalysis: jest.fn(),
    sendAIDrawing: jest.fn(),
    sendGenerateObject: jest.fn(),
    sendTextMessageStream: jest.fn(),
    sendImageMessageStream: jest.fn(),
    sendCanvasAnalysisStream: jest.fn(),
    sendAIDrawingWithTypewriter: jest.fn(),
    reloadChatroomHistory: jest.fn(),
    currentChatroomId: 'test-chatroom-123'
  };

  beforeEach(() => {
    useChatMessages.mockReturnValue(defaultMockReturn);
    apiConfig.delete.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders ChatRoom with basic elements', () => {
      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByText('AI 夥伴')).toBeInTheDocument();
      expect(screen.getByText('你的創藝好夥伴')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-area')).toBeInTheDocument();
    });

    test('renders assistant icon and title', () => {
      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByText('AI 夥伴')).toBeInTheDocument();
    });

    test('renders beta chip', () => {
      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByText('你的創藝好夥伴')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading skeleton when historyLoading is true', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        historyLoading: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      // Check for skeleton elements by looking for MUI skeleton class
      const container = document.body;
      const skeletonElements = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    test('shows message loading indicator when loading new message', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        loading: true,
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByText('正在思考中...')).toBeInTheDocument();
    });

    test('disables input area when loading', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        loading: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByTestId('send-button')).toBeDisabled();
    });

    test('disables input area when disabled from hook', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        disabled: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByTestId('send-button')).toBeDisabled();
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no messages and history loaded', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        historyLoaded: true,
        messages: []
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByText('沒有聊天記錄，輸入訊息開始對話吧！')).toBeInTheDocument();
      expect(screen.getByText('聊天室 ID: test-chatroom-123')).toBeInTheDocument();
    });

    test('shows preparing message when history not loaded', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        historyLoaded: false,
        messages: []
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByText('準備載入聊天記錄...')).toBeInTheDocument();
    });
  });

  describe('Messages Display', () => {
    test('renders chat messages when messages exist', () => {
      const mockMessages = [
        { id: '1', message: 'Hello', isUser: true, timestamp: '2024-01-01 12:00:00' },
        { id: '2', message: 'Hi there!', isUser: false, timestamp: '2024-01-01 12:01:00' }
      ];

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: mockMessages,
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getAllByTestId('chat-message')).toHaveLength(2);
      expect(screen.getByText('User: Hello')).toBeInTheDocument();
      expect(screen.getByText('AI: Hi there!')).toBeInTheDocument();
    });
  });

  describe('Clear Chat Functionality - Ref Method', () => {
    test('exposes handleClearChatroom method via ref', () => {
      const refMock = { current: null };
      
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Check that the ref has the handleClearChatroom method
      expect(refMock.current).toBeDefined();
      expect(refMock.current.handleClearChatroom).toBeDefined();
      expect(typeof refMock.current.handleClearChatroom).toBe('function');
    });

    test('handleClearChatroom opens confirmation dialog', () => {
      const refMock = { current: null };
      
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Call the method via ref
      act(() => {
        refMock.current.handleClearChatroom();
      });
      
      expect(screen.getByText('清空聊天室')).toBeInTheDocument();
      expect(screen.getByText('確定要清空這個聊天室的所有訊息嗎？此操作無法復原。')).toBeInTheDocument();
    });

    test('closes dialog when cancel clicked via ref method', async () => {
      const refMock = { current: null };
      
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Open dialog via ref
      act(() => {
        refMock.current.handleClearChatroom();
      });
      
      // Click cancel
      const cancelButton = screen.getByText('取消');
      
      await act(async () => {
        fireEvent.click(cancelButton);
      });
      
      // Dialog should be closed - wait for DOM update
      await waitFor(() => {
        expect(screen.queryByText('確定要清空這個聊天室的所有訊息嗎？此操作無法復原。')).not.toBeInTheDocument();
      });
    });

    test('calls clear API and reloads history when confirmed via ref method', async () => {
      apiConfig.delete.mockResolvedValueOnce({
        status: 200,
        data: 'Success'
      });

      const mockReload = jest.fn();
      const refMock = { current: null };
      
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        reloadChatroomHistory: mockReload
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Open dialog via ref
      act(() => {
        refMock.current.handleClearChatroom();
      });
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(apiConfig.delete).toHaveBeenCalledWith(
        '/api/messages/chatroom/test-chatroom-123',
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      await waitFor(() => {
        expect(mockReload).toHaveBeenCalled();
      });
    });

    test('handles API error gracefully via ref method', async () => {
      const apiError = new Error('API Error');
      apiConfig.delete.mockRejectedValueOnce(apiError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockReload = jest.fn();
      const refMock = { current: null };

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        reloadChatroomHistory: mockReload
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Open dialog via ref
      act(() => {
        refMock.current.handleClearChatroom();
      });
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('清空聊天室失敗:', apiError);
      expect(mockReload).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('shows loading state during clearing via ref method', async () => {
      apiConfig.delete.mockImplementationOnce(() => new Promise(resolve => {
        setTimeout(() => resolve({ status: 200, data: 'Success' }), 100);
      }));

      const refMock = { current: null };
      
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Open dialog via ref
      act(() => {
        refMock.current.handleClearChatroom();
      });
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      fireEvent.click(confirmButton);
      
      // Should show loading state
      expect(screen.getByText('清空中...')).toBeInTheDocument();
    });

    test('handles missing currentChatroomId gracefully via ref method', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const refMock = { current: null };

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        currentChatroomId: null
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Open dialog via ref
      act(() => {
        refMock.current.handleClearChatroom();
      });
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('沒有可用的聊天室ID');
      expect(apiConfig.delete).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('handles network error during clearing via ref method', async () => {
      const networkError = new Error('Network error');
      apiConfig.delete.mockRejectedValueOnce(networkError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockReload = jest.fn();
      const refMock = { current: null };

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        reloadChatroomHistory: mockReload
      });

      renderWithTheme(<ChatRoom ref={refMock} canvas={mockCanvas} />);
      
      // Open dialog via ref
      act(() => {
        refMock.current.handleClearChatroom();
      });
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('清空聊天室失敗:', networkError);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Input Integration', () => {
    test('passes correct props to TextInputArea', () => {
      const mockSendTextMessageStream = jest.fn();
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        sendTextMessageStream: mockSendTextMessageStream
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);
      
      expect(mockSendTextMessageStream).toHaveBeenCalledWith('test message');
    });
  });

  describe('onDisabledChange Callback', () => {
    test('calls onDisabledChange when disabled state changes', () => {
      const mockOnDisabledChange = jest.fn();
      
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        disabled: true
      });

      renderWithTheme(
        <ChatRoom 
          canvas={mockCanvas} 
          onDisabledChange={mockOnDisabledChange} 
        />
      );
      
      expect(mockOnDisabledChange).toHaveBeenCalledWith(true);
    });

    test('calls onDisabledChange with combined disabled state', () => {
      const mockOnDisabledChange = jest.fn();
      
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        disabled: false,
        loading: true,
        historyLoading: false
      });

      renderWithTheme(
        <ChatRoom 
          canvas={mockCanvas} 
          onDisabledChange={mockOnDisabledChange} 
        />
      );
      
      expect(mockOnDisabledChange).toHaveBeenCalledWith(true);
    });
  });

  describe('PropTypes', () => {
    test('renders correctly with canvas prop', () => {
      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.getByText('AI 夥伴')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-area')).toBeInTheDocument();
    });

    test('renders correctly without canvas prop', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithTheme(<ChatRoom />);
      
      expect(screen.getByText('AI 夥伴')).toBeInTheDocument();
      expect(screen.getByTestId('text-input-area')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});