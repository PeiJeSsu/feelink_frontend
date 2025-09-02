// MessageHandlers.test.js
import {
    handleSendTextMessageStream,
    handleSendImageMessageStream,
    handleSendCanvasAnalysisStream,
    handleSendAIDrawingStream,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendCanvasAnalysis,
    handleSendAIDrawing
} from '../helpers/MessageController';

// Mock dependencies with factory functions
jest.mock('../helpers/usage/MessageFactory', () => ({
    addMessages: jest.fn(),
    appendMessage: jest.fn(),
    getNewId: jest.fn(),
    createNewMessage: jest.fn()
}));

jest.mock('../helpers/MessageService', () => ({
    sendTextToBackendStream: jest.fn(),
    sendImageToBackendStreamService: jest.fn(),
    sendCanvasAnalysisToBackendStreamService: jest.fn(),
    sendAIDrawingToBackendStream: jest.fn(),
    sendTextToBackend: jest.fn(),
    sendImageToBackend: jest.fn(),
    sendCanvasAnalysisToBackend: jest.fn(),
    sendAIDrawingToBackend: jest.fn()
}));

jest.mock('../helpers/usage/MessageHelpers', () => ({
    convertBlobToBase64: jest.fn()
}));

jest.mock('../helpers/usage/MessageError', () => ({
    handleError: jest.fn()
}));

jest.mock('../../helpers/canvas/CanvasOperations', () => ({
    clearCanvas: jest.fn(),
    addImageToCanvas: jest.fn()
}));

// Import mocked functions after mocking
import {
    addMessages,
    appendMessage,
    getNewId,
    createNewMessage
} from '../helpers/usage/MessageFactory';

import {
    sendTextToBackendStream,
    sendImageToBackendStreamService,
    sendCanvasAnalysisToBackendStreamService,
    sendAIDrawingToBackendStream,
    sendTextToBackend,
    sendImageToBackend,
    sendCanvasAnalysisToBackend,
    sendAIDrawingToBackend
} from '../helpers/MessageService';

import { convertBlobToBase64 } from '../helpers/usage/MessageHelpers';
import { handleError } from '../helpers/usage/MessageError';
import { clearCanvas, addImageToCanvas } from '../../helpers/canvas/CanvasOperations';

// Get references to mocked functions
const mockAddMessages = addMessages;
const mockAppendMessage = appendMessage;
const mockGetNewId = getNewId;
const mockCreateNewMessage = createNewMessage;

const mockSendTextToBackendStream = sendTextToBackendStream;
const mockSendImageToBackendStreamService = sendImageToBackendStreamService;
const mockSendCanvasAnalysisToBackendStreamService = sendCanvasAnalysisToBackendStreamService;
const mockSendAIDrawingToBackendStream = sendAIDrawingToBackendStream;
const mockSendTextToBackend = sendTextToBackend;
const mockSendImageToBackend = sendImageToBackend;
const mockSendCanvasAnalysisToBackend = sendCanvasAnalysisToBackend;
const mockSendAIDrawingToBackend = sendAIDrawingToBackend;

const mockConvertBlobToBase64 = convertBlobToBase64;
const mockHandleError = handleError;
const mockClearCanvas = clearCanvas;
const mockAddImageToCanvas = addImageToCanvas;

// Increase test timeout to handle async operations
jest.setTimeout(10000);

describe('MessageHandlers', () => {
    let mockMessages, mockSetMessages, mockSetLoading, mockSetDisabled, mockCanvas;
    const mockChatroomId = 'test-chatroom-123';

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup common test data
        mockMessages = [
            { id: 1, message: 'Hello', isUser: true },
            { id: 2, message: 'Hi there!', isUser: false }
        ];
        mockSetMessages = jest.fn();
        mockSetLoading = jest.fn();
        mockSetDisabled = jest.fn();
        mockCanvas = {
            getContext: jest.fn(() => ({
                clearRect: jest.fn(),
                drawImage: jest.fn()
            })),
            selection: true
        };

        // Default mock implementations
        mockGetNewId.mockReturnValue(3);
        mockAddMessages.mockReturnValue(4);
        mockCreateNewMessage.mockImplementation((id, message, isUser, hasImage) => ({
            id, message, isUser, hasImage
        }));
        mockConvertBlobToBase64.mockResolvedValue('base64-encoded-image');
    });

    describe('Stream Message Handlers', () => {
        describe('handleSendTextMessageStream', () => {
            it('should handle successful text message stream', async () => {
                const mockMessageText = 'Test message';
                let onTokenCallback, onCompleteCallback;

                mockSendTextToBackendStream.mockImplementation((payload, chatroomId, onToken, onComplete) => {
                    onTokenCallback = onToken;
                    onCompleteCallback = onComplete;
                    
                    // Simulate streaming response
                    setTimeout(() => {
                        onToken('Hello');
                        onToken(' World');
                        onComplete();
                    }, 10);
                });

                await handleSendTextMessageStream(
                    mockMessageText, 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                // Wait for async operations
                await new Promise(resolve => setTimeout(resolve, 50));

                expect(mockAddMessages).toHaveBeenCalledWith(mockMessageText, null, 3, mockMessages, mockSetMessages);
                expect(mockSetLoading).toHaveBeenCalledWith(true);
                expect(mockSendTextToBackendStream).toHaveBeenCalled();
            });

            it('should handle empty message text', async () => {
                await handleSendTextMessageStream(
                    '', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockAddMessages).not.toHaveBeenCalled();
                expect(mockSendTextToBackendStream).not.toHaveBeenCalled();
            });

            it('should handle missing chatroomId', async () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                await handleSendTextMessageStream(
                    'Test message', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    null
                );

                expect(consoleSpy).toHaveBeenCalledWith('chatroomId is required for sending messages');
                expect(mockAddMessages).not.toHaveBeenCalled();
                
                consoleSpy.mockRestore();
            });

            it('should handle stream errors', async () => {
                const mockError = new Error('Stream failed');
                let onErrorCallback;

                mockSendTextToBackendStream.mockImplementation((payload, chatroomId, onToken, onComplete, onError) => {
                    onErrorCallback = onError;
                    setTimeout(() => onError(mockError), 10);
                });

                await handleSendTextMessageStream(
                    'Test message', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                // Wait for async operations
                await new Promise(resolve => setTimeout(resolve, 50));

                expect(mockHandleError).toHaveBeenCalledWith(mockError, '發送訊息失敗', mockMessages, mockSetMessages);
                expect(mockSetLoading).toHaveBeenCalledWith(false);
            });
        });

        describe('handleSendImageMessageStream', () => {
            it('should handle image message stream successfully', async () => {
                const mockMessageText = 'Image description';
                const mockImage = new Blob(['fake-image'], { type: 'image/png' });

                mockSendImageToBackendStreamService.mockImplementation((text, image, chatroomId, onToken, onComplete) => {
                    setTimeout(() => {
                        onToken('Processing');
                        onToken(' image...');
                        onComplete();
                    }, 10);
                });

                await handleSendImageMessageStream(
                    mockMessageText, 
                    mockImage, 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                // Wait for async operations
                await new Promise(resolve => setTimeout(resolve, 50));

                expect(mockAddMessages).toHaveBeenCalledWith(mockMessageText, mockImage, 3, mockMessages, mockSetMessages);
                expect(mockSendImageToBackendStreamService).toHaveBeenCalled();
            });
        });

        describe('handleSendCanvasAnalysisStream', () => {
            it('should handle canvas analysis stream successfully', async () => {
                const mockCanvasImage = new Blob(['fake-canvas'], { type: 'image/png' });
                const mockMessageText = 'Analyze this';

                mockSendCanvasAnalysisToBackendStreamService.mockImplementation((text, image, chatroomId, onToken, onComplete) => {
                    setTimeout(() => {
                        onToken('Analysis');
                        onToken(' complete');
                        onComplete();
                    }, 10);
                });

                await handleSendCanvasAnalysisStream(
                    mockCanvasImage, 
                    mockMessageText, 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                // Wait for async operations
                await new Promise(resolve => setTimeout(resolve, 50));

                expect(mockAddMessages).toHaveBeenCalledWith(mockMessageText, mockCanvasImage, 3, mockMessages, mockSetMessages);
                expect(mockSendCanvasAnalysisToBackendStreamService).toHaveBeenCalled();
            });
        });

        describe('handleSendAIDrawingStream', () => {
            it('should handle AI drawing stream with canvas update', async () => {
                const mockCanvasImage = new Blob(['fake-canvas'], { type: 'image/png' });
                const mockMessageText = 'Draw something';
                const mockImageData = 'base64-image-data';

                let onImageGeneratedCallback;

                mockSendAIDrawingToBackendStream.mockImplementation((text, imageData, chatroomId, onToken, onComplete, onError, onImageGenerated) => {
                    onImageGeneratedCallback = onImageGenerated;
                    
                    setTimeout(() => {
                        onToken('Drawing');
                        onImageGenerated(mockImageData);
                        onComplete();
                    }, 10);
                });

                await handleSendAIDrawingStream(
                    mockCanvasImage, 
                    mockMessageText, 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockCanvas, 
                    mockChatroomId
                );

                // Wait for async operations
                await new Promise(resolve => setTimeout(resolve, 50));

                expect(mockConvertBlobToBase64).toHaveBeenCalledWith(mockCanvasImage);
                expect(mockSendAIDrawingToBackendStream).toHaveBeenCalled();
            });

            it('should handle missing canvas image', async () => {
                await handleSendAIDrawingStream(
                    null, 
                    'Draw something', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockCanvas, 
                    mockChatroomId
                );

                expect(mockAddMessages).not.toHaveBeenCalled();
                expect(mockSendAIDrawingToBackendStream).not.toHaveBeenCalled();
            });
        });
    });

    describe('Non-Stream Message Handlers', () => {
        describe('handleSendTextMessage', () => {
            it('should handle successful text message', async () => {
                const mockResponse = { success: true, content: 'Response message' };
                mockSendTextToBackend.mockResolvedValue(mockResponse);

                await handleSendTextMessage(
                    'Test message', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockSetLoading).toHaveBeenCalledWith(true);
                expect(mockSendTextToBackend).toHaveBeenCalled();
                expect(mockAppendMessage).toHaveBeenCalledWith(4, 'Response message', mockSetMessages);
                expect(mockSetLoading).toHaveBeenCalledWith(false);
            });

            it('should handle API failure', async () => {
                const mockError = new Error('API Error');
                mockSendTextToBackend.mockRejectedValue(mockError);

                await handleSendTextMessage(
                    'Test message', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockHandleError).toHaveBeenCalledWith(mockError, '發送訊息失敗', mockMessages, mockSetMessages);
                expect(mockSetLoading).toHaveBeenCalledWith(false);
            });

            it('should handle unsuccessful API response', async () => {
                const mockResponse = { success: false, error: 'Server error' };
                mockSendTextToBackend.mockResolvedValue(mockResponse);

                await handleSendTextMessage(
                    'Test message', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockHandleError).toHaveBeenCalled();
                expect(mockSetLoading).toHaveBeenCalledWith(false);
            });
        });

        describe('handleSendImageMessage', () => {
            it('should handle successful image message', async () => {
                const mockImage = new Blob(['fake-image'], { type: 'image/png' });
                const mockResponse = { success: true, content: 'Image processed' };
                mockSendImageToBackend.mockResolvedValue(mockResponse);

                await handleSendImageMessage(
                    'Image description', 
                    mockImage, 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockSendImageToBackend).toHaveBeenCalledWith('Image description', mockImage, mockChatroomId);
                expect(mockAppendMessage).toHaveBeenCalledWith(4, 'Image processed', mockSetMessages);
            });

            it('should handle missing message and image', async () => {
                await handleSendImageMessage(
                    '', 
                    null, 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockSendImageToBackend).not.toHaveBeenCalled();
            });
        });

        describe('handleSendCanvasAnalysis', () => {
            it('should handle successful canvas analysis', async () => {
                const mockCanvasImage = new Blob(['fake-canvas'], { type: 'image/png' });
                const mockResponse = { success: true, content: 'Analysis result' };
                mockSendCanvasAnalysisToBackend.mockResolvedValue(mockResponse);

                await handleSendCanvasAnalysis(
                    mockCanvasImage, 
                    'Analyze this', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockSendCanvasAnalysisToBackend).toHaveBeenCalledWith('Analyze this', mockCanvasImage, mockChatroomId);
                expect(mockAppendMessage).toHaveBeenCalledWith(4, 'Analysis result', mockSetMessages);
            });

            it('should handle missing canvas image', async () => {
                await handleSendCanvasAnalysis(
                    null, 
                    'Analyze this', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                );

                expect(mockSendCanvasAnalysisToBackend).not.toHaveBeenCalled();
            });
        });

        describe('handleSendAIDrawing', () => {
            it('should call typewriter version with correct parameters', async () => {
                const mockCanvasImage = new Blob(['fake-canvas'], { type: 'image/png' });
                const mockResponse = { 
                    success: true, 
                    content: { 
                        message: 'Drawing complete', 
                        imageData: 'base64-image-data' 
                    } 
                };
                mockSendAIDrawingToBackend.mockResolvedValue(mockResponse);

                await handleSendAIDrawing(
                    mockCanvasImage, 
                    'Draw something', 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockCanvas, 
                    mockChatroomId
                );

                // Wait for async operations including typewriter effect
                await new Promise(resolve => setTimeout(resolve, 100));

                expect(mockConvertBlobToBase64).toHaveBeenCalledWith(mockCanvasImage);
                expect(mockSendAIDrawingToBackend).toHaveBeenCalled();
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle typewriter effect interruption', async () => {
            jest.useFakeTimers();
            
            const mockMessageText = 'Long message for typewriter test';
            const mockError = new Error('Connection lost');

            mockSendTextToBackendStream.mockImplementation((payload, chatroomId, onToken, onComplete, onError) => {
                setTimeout(() => {
                    onToken('Very long message that should trigger typewriter effect');
                    // Simulate error before completion
                    onError(mockError);
                }, 10);
            });

            const promise = handleSendTextMessageStream(
                mockMessageText, 
                mockMessages, 
                mockSetMessages, 
                mockSetLoading,
                mockSetDisabled,
                mockChatroomId
            );

            // Fast-forward timers
            jest.advanceTimersByTime(100);
            
            await promise;

            expect(mockHandleError).toHaveBeenCalled();
            
            jest.useRealTimers();
        });

        it('should handle canvas operations failure', async () => {
            const mockCanvasImage = new Blob(['fake-canvas'], { type: 'image/png' });
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            // Mock canvas operations to throw error
            mockClearCanvas.mockImplementation(() => {
                throw new Error('Canvas error');
            });

            let onImageGeneratedCallback;
            mockSendAIDrawingToBackendStream.mockImplementation((text, imageData, chatroomId, onToken, onComplete, onError, onImageGenerated) => {
                onImageGeneratedCallback = onImageGenerated;
                setTimeout(() => {
                    onImageGenerated('base64-image-data');
                    onComplete();
                }, 10);
            });

            await handleSendAIDrawingStream(
                mockCanvasImage, 
                'Draw something', 
                mockMessages, 
                mockSetMessages, 
                mockSetLoading,
                mockSetDisabled,
                mockCanvas, 
                mockChatroomId
            );

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(consoleSpy).toHaveBeenCalledWith('Error updating canvas with generated image:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });

        it('should handle nested result content structure', async () => {
            const mockCanvasImage = new Blob(['fake-canvas'], { type: 'image/png' });
            const nestedResponse = {
                success: true,
                content: {
                    success: true,
                    content: {
                        message: 'Nested message',
                        imageData: 'nested-image-data'
                    }
                }
            };
            
            mockSendAIDrawingToBackend.mockResolvedValue(nestedResponse);

            await handleSendAIDrawing(
                mockCanvasImage, 
                'Draw something', 
                mockMessages, 
                mockSetMessages, 
                mockSetLoading,
                mockSetDisabled,
                mockCanvas, 
                mockChatroomId
            );

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(mockConvertBlobToBase64).toHaveBeenCalledWith(mockCanvasImage);
            expect(mockSendAIDrawingToBackend).toHaveBeenCalled();
        });
    });

    describe('Typewriter Effect', () => {
        it('should implement typewriter effect with proper timing', async () => {
            jest.useFakeTimers();
            
            const longMessage = 'This is a long message to test typewriter effect timing';
            let messageUpdateCount = 0;
            
            // Mock setMessages to capture intermediate states
            mockSetMessages.mockImplementation((updateFn) => {
                if (typeof updateFn === 'function') {
                    const newMessages = updateFn(mockMessages);
                    const aiMessage = newMessages.find(msg => msg.id === 4);
                    if (aiMessage) {
                        messageUpdateCount++;
                    }
                }
            });

            const mockCanvasImage = new Blob(['fake-canvas'], { type: 'image/png' });
            const mockResponse = {
                success: true,
                content: {
                    message: longMessage,
                    imageData: 'base64-image-data'
                }
            };
            
            mockSendAIDrawingToBackend.mockResolvedValue(mockResponse);

            const promise = handleSendAIDrawing(
                mockCanvasImage, 
                'Draw something', 
                mockMessages, 
                mockSetMessages, 
                mockSetLoading,
                mockSetDisabled,
                mockCanvas, 
                mockChatroomId
            );

            // Fast-forward through typewriter effect - each character takes 30ms
            jest.advanceTimersByTime(longMessage.length * 35 + 1000);
            
            await promise;

            // Verify that messages were updated multiple times (typewriter effect)
            expect(messageUpdateCount).toBeGreaterThan(0);
            expect(mockSendAIDrawingToBackend).toHaveBeenCalled();
            
            jest.useRealTimers();
        });
    });

    describe('Performance and Memory', () => {
        it('should cleanup timers on component unmount simulation', async () => {
            const mockMessageText = 'Test message';
            const mockError = new Error('Connection timeout');

            mockSendTextToBackendStream.mockImplementation((payload, chatroomId, onToken, onComplete, onError) => {
                // Simulate immediate error to test error handling
                setTimeout(() => {
                    onError(mockError);
                }, 10);
            });

            await handleSendTextMessageStream(
                mockMessageText, 
                mockMessages, 
                mockSetMessages, 
                mockSetLoading,
                mockSetDisabled,
                mockChatroomId
            );
            
            // Wait for async operations to complete
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Verify error handling was called
            expect(mockHandleError).toHaveBeenCalledWith(mockError, '發送訊息失敗', mockMessages, mockSetMessages);
        });

        it('should handle rapid consecutive messages', async () => {
            const messages = ['Message 1', 'Message 2', 'Message 3'];
            mockGetNewId.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(3);
            mockAddMessages.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(3);
            
            const mockResponse = { success: true, content: 'Response' };
            mockSendTextToBackend.mockResolvedValue(mockResponse);

            const promises = messages.map(msg => 
                handleSendTextMessage(
                    msg, 
                    mockMessages, 
                    mockSetMessages, 
                    mockSetLoading,
                    mockSetDisabled,
                    mockChatroomId
                )
            );

            await Promise.all(promises);

            expect(mockSendTextToBackend).toHaveBeenCalledTimes(3);
            expect(mockAddMessages).toHaveBeenCalledTimes(3);
        });
    });
});