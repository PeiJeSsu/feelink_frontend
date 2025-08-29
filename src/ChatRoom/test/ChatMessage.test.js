import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatMessage from '../components/ChatMessage';

// Mock the styles module
jest.mock('../styles/ChatMessageStyles', () => ({
  chatMessageStyles: {
    container: jest.fn((isUser) => ({
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      marginBottom: 2,
    })),
    avatar: {
      width: 32,
      height: 32,
      fontSize: '16px',
    },
    messageBox: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '70%',
    },
    paper: jest.fn((isUser) => ({
      padding: 1,
      backgroundColor: isUser ? '#1976d2' : '#f5f5f5',
      color: isUser ? 'white' : 'black',
    })),
    text: {
      fontSize: '14px',
      lineHeight: 1.5,
    },
    image: {
      maxWidth: '300px',
      maxHeight: '300px',
      borderRadius: '8px',
    },
    markdown: {
      fontSize: '14px',
      lineHeight: 1.5,
    },
    timeStamp: {
      fontSize: '12px',
      color: '#666',
      marginTop: '4px',
    },
  },
}));

// Mock MarkdownIt
jest.mock('markdown-it', () => {
  return jest.fn().mockImplementation(() => ({
    render: jest.fn((text) => `<p>${text}</p>`),
  }));
});

const theme = createTheme();

// Helper function to render component with theme
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ChatMessage', () => {
  const defaultProps = {
    message: 'Test message',
    isUser: false,
    isImage: false,
    timestamp: '2024-01-01 12:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本渲染測試', () => {
    it('應該正確渲染非用戶消息', () => {
      renderWithTheme(<ChatMessage {...defaultProps} />);
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01 12:00')).toBeInTheDocument();
      expect(screen.getByText('🤖')).toBeInTheDocument();
    });

    it('應該正確渲染用戶消息', () => {
      renderWithTheme(
        <ChatMessage {...defaultProps} isUser={true} />
      );
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01 12:00')).toBeInTheDocument();
      expect(screen.queryByText('🤖')).not.toBeInTheDocument();
    });

    it('應該正確渲染空消息', () => {
      renderWithTheme(
        <ChatMessage {...defaultProps} message="" />
      );
      
      expect(screen.getByText('2024-01-01 12:00')).toBeInTheDocument();
    });
  });

  describe('圖片消息測試', () => {
    it('應該正確渲染圖片消息', () => {
      const imageProps = {
        ...defaultProps,
        message: 'https://example.com/image.jpg',
        isImage: true,
      };

      renderWithTheme(<ChatMessage {...imageProps} />);
      
      const image = screen.getByAltText('上傳的圖片');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('圖片消息不應該顯示文字內容', () => {
      const imageProps = {
        ...defaultProps,
        message: 'https://example.com/image.jpg',
        isImage: true,
      };

      renderWithTheme(<ChatMessage {...imageProps} />);
      
      expect(screen.queryByText('https://example.com/image.jpg')).not.toBeInTheDocument();
      expect(screen.getByAltText('上傳的圖片')).toBeInTheDocument();
    });
  });

  describe('純文字消息測試', () => {
    it('應該正確處理純文字消息', () => {
      const plainTextMessages = [
        'This is plain text',
        'No special characters here',
        '12345',
      ];

      plainTextMessages.forEach((message) => {
        const { unmount } = renderWithTheme(
          <ChatMessage {...defaultProps} message={message} />
        );
        
        expect(screen.getByText(message)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('頭像顯示測試', () => {
    it('非用戶消息應該顯示機器人頭像', () => {
      renderWithTheme(<ChatMessage {...defaultProps} isUser={false} />);
      
      expect(screen.getByText('🤖')).toBeInTheDocument();
    });

    it('用戶消息不應該顯示頭像', () => {
      renderWithTheme(<ChatMessage {...defaultProps} isUser={true} />);
      
      expect(screen.queryByText('🤖')).not.toBeInTheDocument();
    });
  });

  describe('樣式應用測試', () => {
    it('應該為用戶消息應用正確的樣式', () => {
      const { chatMessageStyles } = require('../styles/ChatMessageStyles');
      
      renderWithTheme(<ChatMessage {...defaultProps} isUser={true} />);
      
      expect(chatMessageStyles.container).toHaveBeenCalledWith(true);
      expect(chatMessageStyles.paper).toHaveBeenCalledWith(true);
    });

    it('應該為非用戶消息應用正確的樣式', () => {
      const { chatMessageStyles } = require('../styles/ChatMessageStyles');
      
      renderWithTheme(<ChatMessage {...defaultProps} isUser={false} />);
      
      expect(chatMessageStyles.container).toHaveBeenCalledWith(false);
      expect(chatMessageStyles.paper).toHaveBeenCalledWith(false);
    });
  });

  describe('時間戳顯示測試', () => {
    it('應該顯示提供的時間戳', () => {
      const timestamp = '2024-12-25 15:30:45';
      
      renderWithTheme(
        <ChatMessage {...defaultProps} timestamp={timestamp} />
      );
      
      expect(screen.getByText(timestamp)).toBeInTheDocument();
    });

    it('應該為不同格式的時間戳正確顯示', () => {
      const timestamps = [
        '12:30',
        '2024-01-01',
        '今天 下午2:30',
        '剛剛',
      ];

      timestamps.forEach((timestamp) => {
        const { unmount } = renderWithTheme(
          <ChatMessage {...defaultProps} timestamp={timestamp} />
        );
        
        expect(screen.getByText(timestamp)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('基本 PropTypes 測試', () => {
    it('應該接受所有必需的 props', () => {
      expect(() => {
        renderWithTheme(<ChatMessage {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理 null 消息', () => {
      renderWithTheme(
        <ChatMessage {...defaultProps} message={null} />
      );
      
      expect(screen.getByText('2024-01-01 12:00')).toBeInTheDocument();
    });

    it('應該處理 undefined 消息', () => {
      renderWithTheme(
        <ChatMessage {...defaultProps} message={undefined} />
      );
      
      expect(screen.getByText('2024-01-01 12:00')).toBeInTheDocument();
    });

    it('應該處理非常長的消息', () => {
      const longMessage = 'A'.repeat(1000);
      
      renderWithTheme(
        <ChatMessage {...defaultProps} message={longMessage} />
      );
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('應該處理包含基本中文字符的消息', () => {
      const specialMessage = '特殊字符測試';
      
      renderWithTheme(
        <ChatMessage {...defaultProps} message={specialMessage} />
      );
      
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe('組件交互測試', () => {
    it('應該正確處理消息類型切換', () => {
      const { rerender } = renderWithTheme(
        <ChatMessage {...defaultProps} message="Text message" isImage={false} />
      );
      
      expect(screen.getByText('Text message')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <ChatMessage {...defaultProps} message="image.jpg" isImage={true} />
        </ThemeProvider>
      );
      
      expect(screen.getByAltText('上傳的圖片')).toBeInTheDocument();
      expect(screen.queryByText('Text message')).not.toBeInTheDocument();
    });

    it('應該正確處理用戶身份切換', () => {
      const { rerender } = renderWithTheme(
        <ChatMessage {...defaultProps} isUser={false} />
      );
      
      expect(screen.getByText('🤖')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <ChatMessage {...defaultProps} isUser={true} />
        </ThemeProvider>
      );
      
      expect(screen.queryByText('🤖')).not.toBeInTheDocument();
    });
  });
});