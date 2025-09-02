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
    const mockOnGenerateObject = jest.fn();
    const mockOnClearNotification = jest.fn();

    // Mock hook return values
    const mockUseTextInput = {
        message: '',
        textInputRef: { current: null },
        imageInputRef: { current: null },
        sendText: jest.fn(),
        messageChange: jest.fn(),
        imageChange: jest.fn(),
        handleAnalyzeCanvas: jest.fn(),
        handleAIDrawing: jest.fn(),
        handleGenerateObject: jest.fn(),
        handleKeyDown: jest.fn(),
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            // Check if main elements are rendered
            expect(screen.getByPlaceholderText('與 AI 夥伴對話...')).toBeInTheDocument();
            expect(screen.getByText('分析畫布')).toBeInTheDocument();
            expect(screen.getByText('畫畫接龍')).toBeInTheDocument();
            expect(screen.getByText('生成物件')).toBeInTheDocument();
            // Check for send button by finding the Send icon
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            const fileInput = document.querySelector('input[type="file"]');
            expect(fileInput).toBeInTheDocument();
            expect(fileInput).toHaveAttribute('accept', 'image/*');
            expect(fileInput).toHaveStyle({ display: 'none' });
        });

        test('renders notification area when inputNotification is provided', () => {
            const notification = {
                message: 'Test notification',
                severity: 'info'
            };

            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                        inputNotification={notification}
                        onClearNotification={mockOnClearNotification}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Test notification')).toBeInTheDocument();
        });

        test('does not render notification area when inputNotification is not provided', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
                        onGenerateObject={mockOnGenerateObject}
                        disabled={true}
                    />
                </TestWrapper>
            );

            expect(useTextInput).toHaveBeenCalledWith(
                mockOnSendMessage,
                mockOnSendImage,
                mockOnAnalyzeCanvas,
                mockOnAIDrawing,
                mockOnGenerateObject,
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
                        onGenerateObject={mockOnGenerateObject}
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            const textField = screen.getByPlaceholderText('與 AI 夥伴對話...');
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            const textField = screen.getByPlaceholderText('與 AI 夥伴對話...');
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

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
                        onGenerateObject={mockOnGenerateObject}
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            const aiDrawingButton = screen.getByText('畫畫接龍');
            await user.click(aiDrawingButton);

            expect(mockUseTextInput.handleAIDrawing).toHaveBeenCalled();
        });

        test('handles generate object button click', async () => {
            const user = userEvent.setup();
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            const generateObjectButton = screen.getByText('生成物件');
            await user.click(generateObjectButton);

            expect(mockUseTextInput.handleGenerateObject).toHaveBeenCalled();
        });

        test('handles file input change', async () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            const fileInput = document.querySelector('input[type="file"]');
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            
            fireEvent.change(fileInput, { target: { files: [file] } });

            expect(mockUseTextInput.imageChange).toHaveBeenCalled();
        });

        test('handles notification close button click', async () => {
            const user = userEvent.setup();
            const notification = {
                message: 'Test notification',
                severity: 'info'
            };

            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                        inputNotification={notification}
                        onClearNotification={mockOnClearNotification}
                    />
                </TestWrapper>
            );

            const closeButton = screen.getByTestId('CloseIcon').closest('button');
            await user.click(closeButton);

            expect(mockOnClearNotification).toHaveBeenCalled();
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
                        onGenerateObject={mockOnGenerateObject}
                        disabled={true}
                    />
                </TestWrapper>
            );

            expect(screen.getByPlaceholderText('與 AI 夥伴對話...')).toBeDisabled();
            expect(screen.getByText('分析畫布').closest('button')).toBeDisabled();
            expect(screen.getByText('畫畫接龍').closest('button')).toBeDisabled();
            expect(screen.getByText('生成物件').closest('button')).toBeDisabled();
            
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
                        onGenerateObject={mockOnGenerateObject}
                        disabled={false}
                    />
                </TestWrapper>
            );

            expect(screen.getByPlaceholderText('與 AI 夥伴對話...')).not.toBeDisabled();
            expect(screen.getByText('分析畫布').closest('button')).not.toBeDisabled();
            expect(screen.getByText('畫畫接龍').closest('button')).not.toBeDisabled();
            expect(screen.getByText('生成物件').closest('button')).not.toBeDisabled();
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

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
                        onGenerateObject={mockOnGenerateObject}
                        disabled={false}
                    />
                </TestWrapper>
            );

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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            expect(isValidMessage).toHaveBeenCalledWith(testMessage);
        });
    });

    describe('Notification Features', () => {
        test('renders different notification severities correctly', () => {
            const { rerender } = render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                        inputNotification={{ message: 'Error message', severity: 'error' }}
                        onClearNotification={mockOnClearNotification}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Error message')).toBeInTheDocument();

            rerender(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                        inputNotification={{ message: 'Success message', severity: 'success' }}
                        onClearNotification={mockOnClearNotification}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Success message')).toBeInTheDocument();
        });

        test('defaults to info severity when severity is not provided', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                        inputNotification={{ message: 'Default message' }}
                        onClearNotification={mockOnClearNotification}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Default message')).toBeInTheDocument();
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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            // Check if all quick action buttons are present
            expect(screen.getByText('分析畫布')).toBeInTheDocument();
            expect(screen.getByText('畫畫接龍')).toBeInTheDocument();
            expect(screen.getByText('生成物件')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        test('has proper ARIA attributes and roles', () => {
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

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
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            // Test tab navigation
            await user.tab();
            expect(screen.getByPlaceholderText('與 AI 夥伴對話...')).toHaveFocus();
        });
    });

    describe('PropTypes Validation', () => {
        test('handles missing optional props gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            render(
                <TestWrapper>
                    <TextInputArea 
                        onSendMessage={mockOnSendMessage}
                        onSendImage={mockOnSendImage}
                        onAnalyzeCanvas={mockOnAnalyzeCanvas}
                        onAIDrawing={mockOnAIDrawing}
                        onGenerateObject={mockOnGenerateObject}
                    />
                </TestWrapper>
            );

            // Component should render without crashing even without optional props
            expect(screen.getByPlaceholderText('與 AI 夥伴對話...')).toBeInTheDocument();
            
            consoleSpy.mockRestore();
        });
    });
});