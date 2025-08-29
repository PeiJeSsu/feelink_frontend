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
    handleSendCanvasAnalysisStream,
    handleSendGenerateObject
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
    handleSendGenerateObject: jest.fn(),
}));

jest.mock('../helpers/MessageService', () => ({
    loadChatroomHistoryService: jest.fn(),
}));

jest.mock('../helpers/usage/MessageHelpers', () => ({
    convertDBMessagesToUIMessages: jest.fn(),
    removeDuplicateMessages: jest.fn(),
}));

// Mock canvas operations
jest.mock('../../helpers/canvas/CanvasOperations', () => ({
    setDrawingMode: jest.fn(),
}));

jest.mock('../../helpers/canvas/PanHelper', () => ({
    setPanningMode: jest.fn(),
}));

jest.mock('../../helpers/shape/ShapeTools', () => ({
    disableShapeDrawing: jest.fn(),
}));

jest.mock('../../helpers/eraser/ObjectEraserTools', () => ({
    disableEraser: jest.fn(),
}));

jest.mock('../../helpers/eraser/PathEraserTools', () => ({
    disablePathEraser: jest.fn(),
}));

jest.mock('../../helpers/paint-bucket/PaintBucketTools', () => ({
    disablePaintBucket: jest.fn(),
}));

jest.mock('../../utils/AlertUtils', () => ({
    showAlert: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('useChatMessages', () => {
    let mockAuthContext;
    let mockCanvas;
    let mockSetInputNotification;
    let originalFetch;

    beforeAll(() => {
        // 保存原始的 fetch
        originalFetch = global.fetch;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        
        // 重置 localStorage mock
        localStorageMock.getItem.mockImplementation((key) => {
            const mockData = {
                'userNickname': '測試用戶',
                'aiPartnerName': '測試AI',
                'preferredLanguage': 'zh-TW'
            };
            return mockData[key] || null;
        });
        
        // 創建 mock canvas，包含更完整的方法
        mockCanvas = {
            toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockImageData'),
            isDrawingMode: false,
            selection: true,
            defaultCursor: 'default',
            hoverCursor: 'move',
            getObjects: jest.fn().mockReturnValue([]),
            getPointer: jest.fn().mockReturnValue({ x: 100, y: 100 }),
            on: jest.fn(),
            off: jest.fn(),
        };

        // Mock setInputNotification function
        mockSetInputNotification = jest.fn();
        
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
        handleSendGenerateObject.mockResolvedValue();

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
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            expect(result.current.messages).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.disabled).toBe(false);
            expect(result.current.historyLoading).toBe(false);
            expect(result.current.historyLoaded).toBe(false);
            expect(result.current.currentChatroomId).toBe('test-chatroom-123');
        });

        test('應該包含預設問題', () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            expect(result.current.predefinedQuestions).toBeDefined();
            expect(typeof result.current.predefinedQuestions).toBe('object');
            expect(result.current.predefinedQuestions['zh-TW']).toBeDefined();
            expect(Array.isArray(result.current.predefinedQuestions['zh-TW'])).toBe(true);
            expect(result.current.predefinedQuestions['zh-TW']).toContain('最近過得如何，有沒有發生什麼有趣或難過的事？');
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

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            // 等待載入完成
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            expect(loadChatroomHistoryService).toHaveBeenCalledWith('test-chatroom-123');
            expect(result.current.messages).toEqual(mockMessages);
        });

        test('當載入歷史訊息失敗時應該正確處理', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            loadChatroomHistoryService.mockRejectedValue(new Error('載入失敗'));

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '載入聊天室歷史訊息時發生錯誤:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        test('當沒有歷史訊息時應該顯示預設問題', async () => {
            loadChatroomHistoryService.mockResolvedValue({
                success: true,
                content: [],
            });
            convertDBMessagesToUIMessages.mockReturnValue([]);
            removeDuplicateMessages.mockReturnValue([]);

            const mockGreetingMessage = {
                id: Date.now(),
                text: '嗨，測試用戶！我是你的 AI 夥伴測試AI。最近過得如何，有沒有發生什麼有趣或難過的事？',
                isUser: false,
            };
            createNewMessage.mockReturnValue(mockGreetingMessage);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 等待預設問題被添加
            await waitFor(() => {
                expect(result.current.messages.length).toBeGreaterThan(0);
            });

            expect(createNewMessage).toHaveBeenCalled();
        });
    });

    describe('流式訊息功能', () => {
        test('sendTextMessageStream 應該正確調用 handleSendTextMessageStream', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            act(() => {
                result.current.sendTextMessageStream('串流文字訊息');
            });

            expect(handleSendTextMessageStream).toHaveBeenCalledWith(
                '串流文字訊息',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });

        test('sendImageMessageStream 應該正確調用 handleSendImageMessageStream', async () => {
            const mockImage = new File(['test'], 'test.png', { type: 'image/png' });
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            act(() => {
                result.current.sendImageMessageStream('串流圖片訊息', mockImage);
            });

            expect(handleSendImageMessageStream).toHaveBeenCalledWith(
                '串流圖片訊息',
                mockImage,
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });

        test('sendCanvasAnalysisStream 應該轉換畫布為 blob 並調用串流處理函數', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendCanvasAnalysisStream('串流分析畫布');
            });

            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
            expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,mockImageData');
            expect(handleSendCanvasAnalysisStream).toHaveBeenCalledWith(
                expect.any(Blob),
                '串流分析畫布',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });
    });

    describe('AI 繪圖功能', () => {
        test('sendAIDrawing 應該轉換畫布為 blob 並調用處理函數', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendAIDrawing('AI 繪圖請求');
            });

            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
            expect(handleSendAIDrawing).toHaveBeenCalledWith(
                expect.any(Blob),
                'AI 繪圖請求',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                mockCanvas,
                'test-chatroom-123'
            );
        });

        test('sendAIDrawingWithTypewriter 應該調用打字機效果版本', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendAIDrawingWithTypewriter('打字機繪圖');
            });

            expect(handleSendAIDrawingWithTypewriter).toHaveBeenCalledWith(
                expect.any(Blob),
                '打字機繪圖',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                mockCanvas,
                'test-chatroom-123'
            );
        });

        test('sendAIDrawingStream 應該調用串流版本', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendAIDrawingStream('串流繪圖');
            });

            expect(handleSendAIDrawingStream).toHaveBeenCalledWith(
                expect.any(Blob),
                '串流繪圖',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                mockCanvas,
                'test-chatroom-123'
            );
        });
    });

    describe('物件生成功能', () => {
        test('sendGenerateObject 應該設置輸入通知', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            await act(async () => {
                await result.current.sendGenerateObject('生成物件');
            });

            expect(mockSetInputNotification).toHaveBeenCalledWith({
                message: '點擊畫布上要生成物件的位置，或按 ESC 鍵取消',
                severity: 'info'
            });
        });
    });

    describe('一般訊息功能', () => {
        test('sendTextMessage 應該正確調用 handleSendTextMessage', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            act(() => {
                result.current.sendTextMessage('測試文字訊息');
            });

            expect(handleSendTextMessage).toHaveBeenCalledWith(
                '測試文字訊息',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123',
                expect.any(String),
                expect.any(Number)
            );
        });

        test('sendImageMessage 應該正確調用 handleSendImageMessage', async () => {
            const mockImage = new File(['test'], 'test.png', { type: 'image/png' });
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            act(() => {
                result.current.sendImageMessage('測試圖片訊息', mockImage);
            });

            expect(handleSendImageMessage).toHaveBeenCalledWith(
                '測試圖片訊息',
                mockImage,
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });

        test('sendCanvasAnalysis 應該轉換畫布為 blob 並調用處理函數', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({
                blob: () => Promise.resolve(mockBlob),
            });

            await act(async () => {
                await result.current.sendCanvasAnalysis('分析畫布內容');
            });

            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
            expect(handleSendCanvasAnalysis).toHaveBeenCalledWith(
                expect.any(Blob),
                '分析畫布內容',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                'test-chatroom-123'
            );
        });
    });

    describe('錯誤處理', () => {
        test('當沒有 currentChatroomId 時應該記錄錯誤', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockAuthContext.currentChatroomId = null;
            useContext.mockReturnValue(mockAuthContext);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            // 等待初始化完成
            await waitFor(() => {
                expect(result.current.currentChatroomId).toBeNull();
            });

            act(() => {
                result.current.sendTextMessage('測試訊息');
            });

            expect(consoleSpy).toHaveBeenCalledWith('No current chatroom ID available');
            consoleSpy.mockRestore();
        });

        test('當畫布不可用時應該拋出錯誤', async () => {
            const { result } = renderHook(() => useChatMessages(null, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await act(async () => {
                await result.current.sendCanvasAnalysis('測試');
            });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('addSystemMessage', () => {
        test('應該添加系統訊息', async () => {
            const mockMessage = {
                id: 123456,
                text: '系統測試訊息',
                isUser: false,
            };
            createNewMessage.mockReturnValue(mockMessage);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

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
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            // 等待初始載入完成
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 重置 mock 以便檢查重新載入
            jest.clearAllMocks();

            act(() => {
                result.current.reloadChatroomHistory();
            });

            // 給予足夠時間讓異步操作完成
            await waitFor(() => {
                expect(loadChatroomHistoryService).toHaveBeenCalledWith('test-chatroom-123');
            }, { timeout: 3000 });
        });
    });

    describe('聊天室切換', () => {
        test('當聊天室 ID 變更時應該重置狀態', async () => {
            const { result, rerender } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            // 等待初始載入
            await waitFor(() => {
                expect(result.current.historyLoaded).toBe(true);
            });

            // 變更聊天室 ID
            mockAuthContext.currentChatroomId = 'new-chatroom-456';
            useContext.mockReturnValue(mockAuthContext);

            rerender();

            // 檢查狀態是否被重置
            expect(result.current.historyLoaded).toBe(false);
            expect(result.current.messages).toEqual([]);

            await waitFor(() => {
                expect(loadChatroomHistoryService).toHaveBeenCalledWith('new-chatroom-456');
            });
        });

        test('當聊天室 ID 為空時應該清空所有狀態', () => {
            mockAuthContext.currentChatroomId = null;
            useContext.mockReturnValue(mockAuthContext);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            expect(result.current.historyLoaded).toBe(false);
            expect(result.current.messages).toEqual([]);
            expect(result.current.currentChatroomId).toBeNull();
        });
    });

    describe('chatroomLoading 狀態處理', () => {
        test('當 chatroomLoading 為 true 時應該跳過載入', () => {
            mockAuthContext.chatroomLoading = true;
            useContext.mockReturnValue(mockAuthContext);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            expect(result.current.historyLoaded).toBe(false);
            expect(loadChatroomHistoryService).not.toHaveBeenCalled();
        });
    });
});