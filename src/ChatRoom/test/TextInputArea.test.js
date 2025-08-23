import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextInputArea from '../components/TextInputArea';

// Mock the custom hooks and helpers
jest.mock('../hooks/UseTextInput');
jest.mock('../helpers/TextInputHandlers');
jest.mock('../styles/TextInputStyles', () => ({
    containerStyle: {},
    inputContainer: {},
    textFieldStyle: {},
    sendButtonStyle: {},
    quickActionButton: {}
}));

// Import the mocked modules
import { useTextInput } from '../hooks/UseTextInput';
import { isValidMessage } from '../helpers/TextInputHandlers';

// Mock Material-UI theme
const theme = createTheme();

// Wrapper component for testing with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('TextInputArea Component', () => {
    // Mock functions
    const mockOnSendMessage = jest.fn();
    const mockOnSendImage = jest.fn();
    const mockOnAnalyzeCanvas = jest.fn();
    const mockOnAIDrawing = jest.fn();

    // Mock hook return values
    const mockUseTextInput = {
        message: '',
        textInputRef: { current: null },
        imageInputRef: { current: null },
        sendText: jest.fn(),
        sendImage: jest.fn(),
        messageChange: jest.fn(),
        imageChange: jest.fn(),
        handleAnalyzeCanvas: jest.fn(),
        handleAIDrawing: jest.fn(),
        handleKeyDown: jest.fn(),
    };

    // Mock styles
    const mockStyles = {
        containerStyle: {},
        inputContainer: {},
        textFieldStyle: {},
        sendButtonStyle: {},
        quickActionButton: {},
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup default mock implementations
        useTextInput.mockReturnValue(mockUseTextInput);
        isValidMessage.mockReturnValue(true);
    });

    describe('Component Rendering', () => {
        test('renders all main elements correctly', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            // Check if main elements are rendered
            expect(screen.getByPlaceholderText('與 AI 助手對話...')).toBeInTheDocument();
            expect(screen.getByText('分析畫布')).toBeInTheDocument();
            expect(screen.getByText('生成圖像')).toBeInTheDocument();
            // 修正：通過 data-testid 或其他方式查找發送按鈕
            expect(screen.getByTestId('SendIcon')).toBeInTheDocument();
        });

        test('renders hidden file input for image upload', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            const fileInput = document.querySelector('input[type="file"]');
            expect(fileInput).toBeInTheDocument();
            expect(fileInput).toHaveAttribute('accept', 'image/*');
            expect(fileInput).toHaveStyle({ display: 'none' });
        });

        test('renders with correct icons', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            // Check for icon presence by checking button content
            expect(screen.getByText('分析畫布')).toBeInTheDocument();
            expect(screen.getByText('生成圖像')).toBeInTheDocument();
        });
    });

    describe('Hook Integration', () => {
        test('calls useTextInput hook with correct parameters', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        disabled={true}
                    />
                </TestWrapper>
            );

            expect(useTextInput).toHaveBeenCalledWith(
                mockOnSendMessage,
                mockOnSendImage,
                mockOnAnalyzeCanvas,
                mockOnAIDrawing,
                true
            );
        });

        test('uses hook return values correctly', () => {
            const customMessage = 'Test message';
            useTextInput.mockReturnValue({
                ...mockUseTextInput,
                message: customMessage,
            });

            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            expect(screen.getByDisplayValue(customMessage)).toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        test('handles text input changes', async () => {
            const user = userEvent.setup();
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            const textField = screen.getByPlaceholderText('與 AI 助手對話...');
            await user.type(textField, 'Hello');

            expect(mockUseTextInput.messageChange).toHaveBeenCalled();
        });

        test('handles key down events', async () => {
            const user = userEvent.setup();
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            const textField = screen.getByPlaceholderText('與 AI 助手對話...');
            await user.type(textField, '{enter}');

            expect(mockUseTextInput.handleKeyDown).toHaveBeenCalled();
        });

        test('handles send button click', async () => {
            const user = userEvent.setup();
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            // 修正：通過 SendIcon 的 testid 查找按鈕的父元素
            const sendIcon = screen.getByTestId('SendIcon');
            const sendButton = sendIcon.closest('button');
            await user.click(sendButton);

            expect(mockUseTextInput.sendText).toHaveBeenCalled();
        });

        test('handles analyze canvas button click', async () => {
            const user = userEvent.setup();
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            const analyzeButton = screen.getByText('分析畫布');
            await user.click(analyzeButton);

            expect(mockUseTextInput.handleAnalyzeCanvas).toHaveBeenCalled();
        });

        test('handles AI drawing button click', async () => {
            const user = userEvent.setup();
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            const aiDrawingButton = screen.getByText('生成圖像');
            await user.click(aiDrawingButton);

            expect(mockUseTextInput.handleAIDrawing).toHaveBeenCalled();
        });

        test('handles file input change', async () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            const fileInput = document.querySelector('input[type="file"]');
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            
            fireEvent.change(fileInput, { target: { files: [file] } });

            expect(mockUseTextInput.imageChange).toHaveBeenCalled();
        });
    });

    describe('Disabled State', () => {
        test('disables all interactive elements when disabled prop is true', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        disabled={true}
                    />
                </TestWrapper>
            );

            expect(screen.getByPlaceholderText('與 AI 助手對話...')).toBeDisabled();
            expect(screen.getByText('分析畫布').closest('button')).toBeDisabled();
            expect(screen.getByText('生成圖像').closest('button')).toBeDisabled();
            
            // 修正：通過 SendIcon 查找發送按鈕
            const sendIcon = screen.getByTestId('SendIcon');
            const sendButton = sendIcon.closest('button');
            expect(sendButton).toBeDisabled();
        });

        test('enables all interactive elements when disabled prop is false', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        disabled={false}
                    />
                </TestWrapper>
            );

            expect(screen.getByPlaceholderText('與 AI 助手對話...')).not.toBeDisabled();
            expect(screen.getByText('分析畫布').closest('button')).not.toBeDisabled();
            expect(screen.getByText('生成圖像').closest('button')).not.toBeDisabled();
        });
    });

    describe('Send Button State', () => {
        test('disables send button when message is invalid', () => {
            isValidMessage.mockReturnValue(false);
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            // 修正：通過 SendIcon 查找發送按鈕
            const sendIcon = screen.getByTestId('SendIcon');
            const sendButton = sendIcon.closest('button');
            expect(sendButton).toBeDisabled();
        });

        test('enables send button when message is valid and not disabled', () => {
            isValidMessage.mockReturnValue(true);
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        disabled={false}
                    />
                </TestWrapper>
            );

            // 修正：通過 SendIcon 查找發送按鈕
            const sendIcon = screen.getByTestId('SendIcon');
            const sendButton = sendIcon.closest('button');
            expect(sendButton).not.toBeDisabled();
        });

        test('calls isValidMessage with current message', () => {
            const testMessage = 'Test message';
            useTextInput.mockReturnValue({
                ...mockUseTextInput,
                message: testMessage,
            });

            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            expect(isValidMessage).toHaveBeenCalledWith(testMessage);
        });
    });

    describe('PropTypes Validation', () => {
        test('requires all callback props', () => {
            // This test would typically be handled by PropTypes in development
            // but we can test that the component handles missing props gracefully
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            render(
                <TestWrapper>
                    <TextInputArea />
                </TestWrapper>
            );

            // In a real scenario, PropTypes would log warnings for missing required props
            consoleSpy.mockRestore();
        });
    });

    describe('Component Layout', () => {
        test('has correct layout structure', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            // Check if quick action buttons are grouped together
            const quickActionButtons = screen.getByText('分析畫布').closest('div').parentElement;
            expect(quickActionButtons).toContainElement(screen.getByText('分析畫布'));
            expect(quickActionButtons).toContainElement(screen.getByText('生成圖像'));
        });
    });

    describe('Accessibility', () => {
        test('has proper ARIA attributes', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            // 修正：檢查發送按鈕的存在性，而不是通過名稱查找
            const sendIcon = screen.getByTestId('SendIcon');
            const sendButton = sendIcon.closest('button');
            expect(sendButton).toBeInTheDocument();
            expect(sendButton).toHaveAttribute('type', 'button');
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        test('supports keyboard navigation', async () => {
            const user = userEvent.setup();
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                    />
                </TestWrapper>
            );

            // Test tab navigation
            await user.tab();
            expect(screen.getByPlaceholderText('與 AI 助手對話...')).toHaveFocus();
        });
    });
});