import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the UseChatMessages hook first
jest.mock('../hooks/UseChatMessages', () => jest.fn());

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

// Mock fetch globally
global.fetch = jest.fn();

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
    historyLoading: false,
    historyLoaded: false,
    sendTextMessage: jest.fn(),
    sendImageMessage: jest.fn(),
    sendCanvasAnalysis: jest.fn(),
    sendAIDrawing: jest.fn(),
    sendTextMessageStream: jest.fn(),
    sendImageMessageStream: jest.fn(),
    sendCanvasAnalysisStream: jest.fn(),
    sendAIDrawingWithTypewriter: jest.fn(),
    reloadChatroomHistory: jest.fn(),
    currentChatroomId: 'test-chatroom-123'
  };

  beforeEach(() => {
    useChatMessages.mockReturnValue(defaultMockReturn);
    fetch.mockClear();
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

  describe('Clear Chat Functionality', () => {
    test('shows clear button when messages exist and history loaded', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      const clearButton = screen.getByTitle('清空聊天室');
      expect(clearButton).toBeInTheDocument();
    });

    test('does not show clear button when no messages', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      expect(screen.queryByTitle('清空聊天室')).not.toBeInTheDocument();
    });

    test('opens confirmation dialog when clear button clicked', () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      const clearButton = screen.getByTitle('清空聊天室');
      fireEvent.click(clearButton);
      
      expect(screen.getByText('清空聊天室')).toBeInTheDocument();
      expect(screen.getByText('確定要清空這個聊天室的所有訊息嗎？此操作無法復原。')).toBeInTheDocument();
    });

    test('closes dialog when cancel clicked', async () => {
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      // Open dialog
      const clearButton = screen.getByTitle('清空聊天室');
      fireEvent.click(clearButton);
      
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

    test('calls clear API and reloads history when confirmed', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Success')
      });

      const mockReload = jest.fn();
      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        reloadChatroomHistory: mockReload
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      // Open dialog
      const clearButton = screen.getByTitle('清空聊天室');
      fireEvent.click(clearButton);
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/messages/chatroom/test-chatroom-123',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      await waitFor(() => {
        expect(mockReload).toHaveBeenCalled();
      });
    });

    test('handles API error gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Error')
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockReload = jest.fn();

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        reloadChatroomHistory: mockReload
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      // Open dialog
      const clearButton = screen.getByTitle('清空聊天室');
      fireEvent.click(clearButton);
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('清空聊天室失敗:', 'Error');
      expect(mockReload).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('shows loading state during clearing', async () => {
      fetch.mockImplementationOnce(() => new Promise(resolve => {
        setTimeout(() => resolve({ ok: true, text: () => Promise.resolve('Success') }), 100);
      }));

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      // Open dialog
      const clearButton = screen.getByTitle('清空聊天室');
      fireEvent.click(clearButton);
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      fireEvent.click(confirmButton);
      
      // Should show loading state
      expect(screen.getByText('清空中...')).toBeInTheDocument();
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

  describe('Error Handling', () => {
    test('handles missing currentChatroomId gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        currentChatroomId: null
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      // Open dialog
      const clearButton = screen.getByTitle('清空聊天室');
      fireEvent.click(clearButton);
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('沒有可用的聊天室ID');
      expect(fetch).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('handles network error during clearing', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockReload = jest.fn();

      useChatMessages.mockReturnValue({
        ...defaultMockReturn,
        messages: [{ id: '1', message: 'Test', isUser: true }],
        historyLoaded: true,
        reloadChatroomHistory: mockReload
      });

      renderWithTheme(<ChatRoom canvas={mockCanvas} />);
      
      // Open dialog
      const clearButton = screen.getByTitle('清空聊天室');
      fireEvent.click(clearButton);
      
      // Click confirm
      const confirmButton = screen.getByText('確認清空');
      
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('清空聊天室時發生錯誤:', expect.any(Error));
      
      consoleSpy.mockRestore();
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