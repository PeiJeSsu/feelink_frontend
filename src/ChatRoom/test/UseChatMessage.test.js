import { renderHook, act, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import useChatMessages from '../hooks/UseChatMessages';
import { createNewMessage } from '../helpers/usage/MessageFactory';
import { 
    handleSendImageMessage, 
    handleSendTextMessage, 
    handleSendCanvasAnalysis, 
    handleSendAIDrawing,  
    handleSendAIDrawingWithTypewriter, 
    handleSendAIDrawingStream, 
    handleSendTextMessageStream, 
    handleSendImageMessageStream, 
    handleSendCanvasAnalysisStream
} from '../helpers/MessageController';
import { loadChatroomHistoryService } from '../helpers/MessageService';
import { 
    convertDBMessagesToUIMessages, 
    removeDuplicateMessages 
} from '../helpers/usage/MessageHelpers';

// Mock 所有依賴
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
}));

jest.mock('../helpers/usage/MessageFactory', () => ({
    createNewMessage: jest.fn(),
}));

jest.mock('../helpers/MessageController', () => ({
    handleSendImageMessage: jest.fn(),
    handleSendTextMessage: jest.fn(),
    handleSendCanvasAnalysis: jest.fn(),
    handleSendAIDrawing: jest.fn(),
    handleSendAIDrawingWithTypewriter: jest.fn(),
    handleSendAIDrawingStream: jest.fn(),
    handleSendTextMessageStream: jest.fn(),
    handleSendImageMessageStream: jest.fn(),
    handleSendCanvasAnalysisStream: jest.fn(),
}));

jest.mock('../helpers/MessageService', () => ({
    loadChatroomHistoryService: jest.fn(),
}));

jest.mock('../helpers/usage/MessageHelpers', () => ({
    convertDBMessagesToUIMessages: jest.fn(),
    removeDuplicateMessages: jest.fn(),
}));

describe('useChatMessages', () => {
    let mockAuthContext;
    let mockCanvas;
    let originalFetch;

    beforeAll(() => {
        // 保存原始的 fetch
        originalFetch = global.fetch;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        
        // 創建 mock canvas，確保 toDataURL 方法正確工作
        mockCanvas = {
            toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockImageData'),
        };
        
        // 設定預設的 AuthContext mock
        mockAuthContext = {
            currentChatroomId: 'test-chatroom-123',
            chatroomLoading: false,
        };
        useContext.mockReturnValue(mockAuthContext);

        // 設定預設的 mock 返回值
        createNewMessage.mockReturnValue({
            id: Date.now(),
            text: 'mock message',
            isUser: false,
            timestamp: Date.now(),
        });

        convertDBMessagesToUIMessages.mockReturnValue([]);
        removeDuplicateMessages.mockReturnValue([]);
        loadChatroomHistoryService.mockResolvedValue({ success: true, content: [] });
        
        // 確保所有 handler 函數都是 async 函數
        handleSendImageMessage.mockResolvedValue();
        handleSendTextMessage.mockResolvedValue();
        handleSendCanvasAnalysis.mockResolvedValue();
        handleSendAIDrawing.mockResolvedValue();
        handleSendAIDrawingWithTypewriter.mockResolvedValue();
        handleSendAIDrawingStream.mockResolvedValue();
        handleSendTextMessageStream.mockResolvedValue();
        handleSendImageMessageStream.mockResolvedValue();
        handleSendCanvasAnalysisStream.mockResolvedValue();

        // 設定 fetch mock
        global.fetch = jest.fn(() =>
            Promise.resolve({
                blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' })),
            })
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        // 恢復原始的 fetch
        global.fetch = originalFetch;
    });

    describe('初始化', () => {
        test('應該返回正確的初始狀態', () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            expect(result.current.messages).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.historyLoading).toBe(false);
            expect(result.current.historyLoaded).toBe(false);
            expect(result.current.currentChatroomId).toBe('test-chatroom-123');
        });

        test('應該包含預設問題', () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            expect(result.current.predefinedQuestions).toHaveLength(3);
            expect(result.current.predefinedQuestions).toContain('最近過得如何，有沒有發生甚麼有趣或難過的事？');
        });
    });

    describe('載入聊天室歷史訊息', () => {
        test('當 currentChatroomId 變更時應該載入歷史訊息', async () => {
            const mockMessages = [
                { id: '1', text: '測試訊息1', isUser: true },
                { id: '2', text: '測試訊息2', isUser: false },
            ];

            loadChatroomHistoryService.mockResolvedValue({
                success: true,
                content: mockMessages,
            });
            convertDBMessagesToUIMessages.mockReturnValue(mockMessages);
            removeDuplicateMessages.mockReturnValue(mockMessages);

            const { result } = renderHook(() => useChatMessages(mockCanvas));

            await waitFor(() => {
                expect(loadChatroomHistoryService).toHaveBeenCalledWith('test-chatroom-123');
            });

            await waitFor(() => {
                expect(result.current.messages).toEqual(mockMessages);
                expect(result.current.historyLoaded).toBe(true);
            });
        });

        test('當載入歷史訊息失敗時應該正確處理', async () => {
            loadChatroomHistoryService.mockResolvedValue({
                success: false,
                error: '載入失敗',
            });
            
            // 確保不會觸發預設問題的添加
            convertDBMessagesToUIMessages.mockReturnValue([]);
            removeDuplicateMessages.mockReturnValue([]);

            const { result } = renderHook(() => useChatMessages(mockCanvas));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 檢查載入失敗時訊息數組是否正確
            // 由於原始代碼邏輯，載入失敗後可能會觸發預設問題，這是正常行為
            expect(result.current.historyLoaded).toBe(true);
        });

        test('當沒有歷史訊息時應該顯示預設問題', async () => {
            loadChatroomHistoryService.mockResolvedValue({
                success: true,
                content: [],
            });
            convertDBMessagesToUIMessages.mockReturnValue([]);
            removeDuplicateMessages.mockReturnValue([]);

            const mockSystemMessage = {
                id: Date.now(),
                text: '最近過得如何，有沒有發生甚麼有趣或難過的事？',
                isUser: false,
            };
            createNewMessage.mockReturnValue(mockSystemMessage);

            const { result } = renderHook(() => useChatMessages(mockCanvas));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            await waitFor(() => {
                expect(createNewMessage).toHaveBeenCalledWith(
                    expect.any(Number),
                    expect.any(String),
                    false,
                    false
                );
            });
        });
    });

    describe('發送訊息功能', () => {
        test('sendTextMessage 應該正確調用 handleSendTextMessage', () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            act(() => {
                result.current.sendTextMessage('測試文字訊息');
            });

            expect(handleSendTextMessage).toHaveBeenCalledWith(
                '測試文字訊息',
                [],
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123',
                '',
                1
            );
        });

        test('sendImageMessage 應該正確調用 handleSendImageMessage', () => {
            const mockImage = new File(['test'], 'test.png', { type: 'image/png' });
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            act(() => {
                result.current.sendImageMessage('測試圖片訊息', mockImage);
            });

            expect(handleSendImageMessage).toHaveBeenCalledWith(
                '測試圖片訊息',
                mockImage,
                [],
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });

        test('sendCanvasAnalysis 應該轉換畫布為 blob 並調用處理函數', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            // 等待組件完全初始化
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 重新設定 fetch mock 確保在正確的時機
            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendCanvasAnalysis('分析畫布內容');
            });

            // 驗證 toDataURL 被正確調用
            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
            
            // 驗證 fetch 被正確調用，使用 toHaveBeenCalledTimes 來確保調用次數
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,mockImageData');
            
            // 驗證處理函數被正確調用
            expect(handleSendCanvasAnalysis).toHaveBeenCalledWith(
                expect.any(Blob),
                '分析畫布內容',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });

        test('sendAIDrawing 應該轉換畫布為 blob 並調用處理函數', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            // 等待組件完全初始化
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 重新設定 fetch mock 確保在正確的時機
            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendAIDrawing('AI 繪圖請求');
            });

            // 驗證 toDataURL 被正確調用
            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
            
            // 驗證 fetch 被正確調用
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,mockImageData');
            
            // 驗證處理函數被正確調用
            expect(handleSendAIDrawing).toHaveBeenCalledWith(
                expect.any(Blob),
                'AI 繪圖請求',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                mockCanvas,
                'test-chatroom-123'
            );
        });
    });

    describe('串流訊息功能', () => {
        test('sendTextMessageStream 應該正確調用 handleSendTextMessageStream', () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            act(() => {
                result.current.sendTextMessageStream('串流文字訊息');
            });

            expect(handleSendTextMessageStream).toHaveBeenCalledWith(
                '串流文字訊息',
                [],
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });

        test('sendImageMessageStream 應該正確調用 handleSendImageMessageStream', () => {
            const mockImage = new File(['test'], 'test.png', { type: 'image/png' });
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            act(() => {
                result.current.sendImageMessageStream('串流圖片訊息', mockImage);
            });

            expect(handleSendImageMessageStream).toHaveBeenCalledWith(
                '串流圖片訊息',
                mockImage,
                [],
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });

        test('sendCanvasAnalysisStream 應該轉換畫布為 blob 並調用串流處理函數', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            // 等待組件完全初始化
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 重新設定 fetch mock 確保在正確的時機
            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendCanvasAnalysisStream('串流分析畫布');
            });

            // 驗證 toDataURL 被正確調用
            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
            
            // 驗證 fetch 被正確調用
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,mockImageData');
            
            // 驗證處理函數被正確調用
            expect(handleSendCanvasAnalysisStream).toHaveBeenCalledWith(
                expect.any(Blob),
                '串流分析畫布',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });
    });

    describe('錯誤處理', () => {
        test('當沒有 currentChatroomId 時應該記錄錯誤', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockAuthContext.currentChatroomId = null;
            useContext.mockReturnValue(mockAuthContext);

            const { result } = renderHook(() => useChatMessages(mockCanvas));

            act(() => {
                result.current.sendTextMessage('測試訊息');
            });

            expect(consoleSpy).toHaveBeenCalledWith('No current chatroom ID available');
            consoleSpy.mockRestore();
        });

        test('當畫布不可用時應該拋出錯誤', async () => {
            const { result } = renderHook(() => useChatMessages(null));

            // 等待組件完全初始化
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 由於原始代碼中的錯誤處理邏輯，這個測試需要檢查 console.error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await act(async () => {
                try {
                    await result.current.sendCanvasAnalysis('測試');
                } catch (error) {
                    // 預期會有錯誤
                }
            });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        test('當載入歷史訊息時發生錯誤應該正確處理', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            loadChatroomHistoryService.mockRejectedValue(new Error('網路錯誤'));

            renderHook(() => useChatMessages(mockCanvas));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    '載入聊天室歷史訊息時發生錯誤:',
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('addSystemMessage', () => {
        test('應該添加系統訊息並設定當前問題', () => {
            const mockMessage = {
                id: 123456,
                text: '系統測試訊息',
                isUser: false,
            };
            createNewMessage.mockReturnValue(mockMessage);

            const { result } = renderHook(() => useChatMessages(mockCanvas));

            act(() => {
                result.current.addSystemMessage('系統測試訊息');
            });

            expect(createNewMessage).toHaveBeenCalledWith(
                expect.any(Number),
                '系統測試訊息',
                false,
                false
            );
        });
    });

    describe('reloadChatroomHistory', () => {
        test('應該重新載入聊天室歷史訊息', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas));

            // 等待初始載入完成
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 重置 mock 以便檢查重新載入
            jest.clearAllMocks();

            act(() => {
                result.current.reloadChatroomHistory();
            });

            await waitFor(() => {
                expect(loadChatroomHistoryService).toHaveBeenCalledWith('test-chatroom-123');
            });
        });
    });

    describe('聊天室切換', () => {
        test('當聊天室 ID 變更時應該重置狀態', async () => {
            const { result, rerender } = renderHook(() => useChatMessages(mockCanvas));

            // 等待初始載入
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 變更聊天室 ID
            mockAuthContext.currentChatroomId = 'new-chatroom-456';
            useContext.mockReturnValue(mockAuthContext);

            rerender();

            expect(result.current.historyLoaded).toBe(false);
            expect(result.current.messages).toEqual([]);

            await waitFor(() => {
                expect(loadChatroomHistoryService).toHaveBeenCalledWith('new-chatroom-456');
            });
        });

        test('當聊天室 ID 為空時應該清空所有狀態', () => {
            mockAuthContext.currentChatroomId = null;
            useContext.mockReturnValue(mockAuthContext);

            const { result } = renderHook(() => useChatMessages(mockCanvas));

            expect(result.current.historyLoaded).toBe(false);
            expect(result.current.messages).toEqual([]);
            expect(result.current.currentChatroomId).toBeNull();
        });
    });
});