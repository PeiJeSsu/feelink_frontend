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
    let consoleSpies;

    beforeAll(() => {
        originalFetch = global.fetch;
        // 統一處理所有 console 方法
        consoleSpies = {
            log: jest.spyOn(console, 'log').mockImplementation(() => {}),
            error: jest.spyOn(console, 'error').mockImplementation(() => {}),
            warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
        };
    });

    afterAll(() => {
        global.fetch = originalFetch;
        Object.values(consoleSpies).forEach(spy => spy.mockRestore());
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        
        // 設置預設的 localStorage mock
        localStorageMock.getItem.mockImplementation((key) => {
            const mockData = {
                'userNickname': '測試用戶',
                'aiPartnerName': '測試AI',
                'preferredLanguage': 'zh-TW'
            };
            return mockData[key] || null;
        });
        
        // 設置預設的畫布 mock
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
            _generateObjectPosition: null,
        };

        mockSetInputNotification = jest.fn();
        
        // 設置預設的認證上下文
        mockAuthContext = {
            currentChatroomId: 'test-chatroom-123',
            chatroomLoading: false,
        };
        useContext.mockReturnValue(mockAuthContext);

        // 設置預設的服務 mock
        createNewMessage.mockReturnValue({
            id: Date.now(),
            text: 'mock message',
            isUser: false,
            timestamp: Date.now(),
        });

        convertDBMessagesToUIMessages.mockReturnValue([]);
        removeDuplicateMessages.mockReturnValue([]);
        loadChatroomHistoryService.mockResolvedValue({ success: true, content: [] });
        
        // 設置所有處理函數的預設 mock
        [
            handleSendImageMessage, handleSendTextMessage, handleSendCanvasAnalysis,
            handleSendAIDrawing, handleSendAIDrawingWithTypewriter, handleSendAIDrawingStream,
            handleSendTextMessageStream, handleSendImageMessageStream, handleSendCanvasAnalysisStream,
            handleSendGenerateObject
        ].forEach(handler => handler.mockResolvedValue());

        // 設置預設的 fetch mock
        global.fetch = jest.fn(() =>
            Promise.resolve({
                blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' })),
            })
        );
    });

    // 建立共用的輔助函數
    const waitForHistoryLoaded = async (result) => {
        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        }, { timeout: 3000 });
    };

    const expectBasicFunctionality = (result) => {
        // 檢查所有基本功能是否存在
        const expectedFunctions = [
            'sendTextMessage', 'sendImageMessage', 'sendCanvasAnalysis', 'sendAIDrawing',
            'sendGenerateObject', 'addSystemMessage', 'sendTextMessageStream', 
            'sendImageMessageStream', 'sendCanvasAnalysisStream', 'sendAIDrawingStream',
            'sendAIDrawingWithTypewriter', 'reloadChatroomHistory'
        ];
        
        expectedFunctions.forEach(funcName => {
            expect(typeof result.current[funcName]).toBe('function');
        });
    };

    describe('基礎功能測試', () => {
        test('應該正確初始化並提供所有必要功能', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            // 檢查初始狀態
            expect(result.current.messages).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.disabled).toBe(false);
            expect(result.current.currentChatroomId).toBe('test-chatroom-123');

            // 檢查所有功能函數
            expectBasicFunctionality(result);

            // 檢查預設問題
            expect(result.current.predefinedQuestions).toBeDefined();
            expect(result.current.predefinedQuestions['zh-TW']).toContain('最近過得如何，有沒有發生什麼有趣或難過的事？');

            await waitForHistoryLoaded(result);
        });

        test('應該正確載入歷史訊息', async () => {
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

            await waitForHistoryLoaded(result);

            expect(loadChatroomHistoryService).toHaveBeenCalledWith('test-chatroom-123');
            expect(result.current.messages).toEqual(mockMessages);
        });

        test('載入失敗時應該正確處理', async () => {
            loadChatroomHistoryService.mockRejectedValue(new Error('載入失敗'));

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitForHistoryLoaded(result);

            expect(consoleSpies.error).toHaveBeenCalledWith(
                '載入聊天室歷史訊息時發生錯誤:',
                expect.any(Error)
            );
        });
    });

    describe('訊息發送功能', () => {
        const testCases = [
            {
                name: 'sendTextMessage',
                action: (result) => result.current.sendTextMessage('測試文字'),
                handler: handleSendTextMessage,
                expectedArgs: ['測試文字', expect.any(Array), expect.any(Function), expect.any(Function), expect.any(Function), 'test-chatroom-123', expect.any(String), expect.any(Number)]
            },
            {
                name: 'sendImageMessage', 
                action: (result) => result.current.sendImageMessage('測試圖片', new File(['test'], 'test.png')),
                handler: handleSendImageMessage,
                expectedArgs: ['測試圖片', expect.any(File), expect.any(Array), expect.any(Function), expect.any(Function), expect.any(Function), 'test-chatroom-123']
            },
            {
                name: 'sendTextMessageStream',
                action: (result) => result.current.sendTextMessageStream('串流文字'),
                handler: handleSendTextMessageStream,
                expectedArgs: ['串流文字', expect.any(Array), expect.any(Function), expect.any(Function), expect.any(Function), 'test-chatroom-123']
            },
            {
                name: 'sendImageMessageStream',
                action: (result) => result.current.sendImageMessageStream('串流圖片', new File(['test'], 'test.png')),
                handler: handleSendImageMessageStream,
                expectedArgs: ['串流圖片', expect.any(File), expect.any(Array), expect.any(Function), expect.any(Function), expect.any(Function), 'test-chatroom-123']
            }
        ];

        testCases.forEach(({ name, action, handler, expectedArgs }) => {
            test(`${name} 應該正確調用對應的處理函數`, async () => {
                const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
                await waitForHistoryLoaded(result);

                act(() => {
                    action(result);
                });

                expect(handler).toHaveBeenCalledWith(...expectedArgs);
            });

            test(`${name} 在沒有聊天室ID時應該記錄錯誤`, () => {
                mockAuthContext.currentChatroomId = null;
                useContext.mockReturnValue(mockAuthContext);

                const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

                act(() => {
                    action(result);
                });

                expect(consoleSpies.error).toHaveBeenCalledWith('No current chatroom ID available');
            });
        });
    });

    describe('畫布相關功能', () => {
        const canvasFunctions = [
            { name: 'sendCanvasAnalysis', args: ['分析畫布'], handler: handleSendCanvasAnalysis },
            { name: 'sendAIDrawing', args: ['AI繪圖'], handler: handleSendAIDrawing },
            { name: 'sendAIDrawingWithTypewriter', args: ['打字機繪圖'], handler: handleSendAIDrawingWithTypewriter },
            { name: 'sendAIDrawingStream', args: ['串流繪圖'], handler: handleSendAIDrawingStream },
            { name: 'sendCanvasAnalysisStream', args: ['串流分析'], handler: handleSendCanvasAnalysisStream }
        ];

        canvasFunctions.forEach(({ name, args, handler }) => {
            test(`${name} 應該轉換畫布並調用處理函數`, async () => {
                const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
                await waitForHistoryLoaded(result);

                const mockBlob = new Blob(['test'], { type: 'image/png' });
                global.fetch.mockResolvedValueOnce({ blob: () => Promise.resolve(mockBlob) });

                await act(async () => {
                    await result.current[name](...args);
                });

                expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
                
                // 根據函數類型調整期望的參數結構
                if (name.includes('Drawing')) {
                    expect(handler).toHaveBeenCalledWith(
                        expect.any(Blob), 
                        args[0], 
                        expect.any(Array), 
                        expect.any(Function), 
                        expect.any(Function), 
                        expect.any(Function),
                        mockCanvas,
                        'test-chatroom-123'
                    );
                } else {
                    // sendCanvasAnalysis 和 sendCanvasAnalysisStream
                    expect(handler).toHaveBeenCalledWith(
                        expect.any(Blob), 
                        args[0], 
                        expect.any(Array), 
                        expect.any(Function), 
                        expect.any(Function), 
                        expect.any(Function),
                        'test-chatroom-123'
                    );
                }
            });

            test(`${name} 在畫布轉換失敗時應該記錄錯誤`, async () => {
                global.fetch.mockRejectedValueOnce(new Error('轉換失敗'));

                const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
                await waitForHistoryLoaded(result);

                await act(async () => {
                    await result.current[name](...args);
                });

                expect(consoleSpies.error).toHaveBeenCalled();
            });
        });

        test('沒有畫布時應該拋出錯誤', async () => {
            const { result } = renderHook(() => useChatMessages(null, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            await act(async () => {
                await result.current.sendCanvasAnalysis('測試');
            });

            expect(consoleSpies.error).toHaveBeenCalled();
        });
    });

    describe('物件生成功能', () => {
        test('應該設置畫布為位置選擇模式', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            await act(async () => {
                await result.current.sendGenerateObject('生成物件');
            });

            expect(mockSetInputNotification).toHaveBeenCalledWith({
                message: '點擊畫布上要生成物件的位置，或按 ESC 鍵取消',
                severity: 'info'
            });
            expect(mockCanvas.on).toHaveBeenCalledWith('mouse:down', expect.any(Function));
        });

        test('應該處理畫布點擊事件', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            let clickHandler;
            mockCanvas.on.mockImplementation((event, handler) => {
                if (event === 'mouse:down') {
                    clickHandler = handler;
                }
            });

            await act(async () => {
                await result.current.sendGenerateObject('生成物件');
            });

            expect(clickHandler).toBeDefined();

            // 模擬畫布點擊
            const mockBlob = new Blob(['test'], { type: 'image/png' });
            global.fetch.mockResolvedValueOnce({ blob: () => Promise.resolve(mockBlob) });

            await act(async () => {
                await clickHandler({ e: { clientX: 100, clientY: 100 } });
            });

            expect(mockCanvas.getPointer).toHaveBeenCalled();
            expect(handleSendGenerateObject).toHaveBeenCalled();
        });

        test('應該處理ESC鍵取消', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            let keydownHandler;
            const originalAddEventListener = window.addEventListener;
            window.addEventListener = jest.fn((event, handler) => {
                if (event === 'keydown') {
                    keydownHandler = handler;
                }
            });

            await act(async () => {
                await result.current.sendGenerateObject('生成物件');
            });

            expect(keydownHandler).toBeDefined();

            // 模擬 ESC 鍵
            act(() => {
                keydownHandler({ key: 'Escape' });
            });

            expect(mockSetInputNotification).toHaveBeenCalledWith(null);

            window.addEventListener = originalAddEventListener;
        });
    });

    describe('聊天室狀態管理', () => {
        test('聊天室ID變更時應該重置狀態並重新載入', async () => {
            const { result, rerender } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            // 變更聊天室ID
            mockAuthContext.currentChatroomId = 'new-chatroom-456';
            useContext.mockReturnValue(mockAuthContext);

            rerender();

            // 檢查狀態是否重置
            expect(result.current.historyLoaded).toBe(false);
            expect(result.current.messages).toEqual([]);

            await waitFor(() => {
                expect(loadChatroomHistoryService).toHaveBeenCalledWith('new-chatroom-456');
            });
        });

        test('chatroomLoading為true時應該跳過載入', () => {
            mockAuthContext.chatroomLoading = true;
            useContext.mockReturnValue(mockAuthContext);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            expect(result.current.historyLoaded).toBe(false);
            expect(loadChatroomHistoryService).not.toHaveBeenCalled();
        });

        test('reloadChatroomHistory應該重新載入歷史訊息', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            jest.clearAllMocks();

            act(() => {
                result.current.reloadChatroomHistory();
            });

            await waitFor(() => {
                expect(loadChatroomHistoryService).toHaveBeenCalledWith('test-chatroom-123');
            });
        });
    });

    describe('預設問題和問候語', () => {
        test('沒有歷史訊息時應該顯示預設問題', async () => {
            loadChatroomHistoryService.mockResolvedValue({ success: true, content: [] });
            convertDBMessagesToUIMessages.mockReturnValue([]);
            removeDuplicateMessages.mockReturnValue([]);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitForHistoryLoaded(result);

            await waitFor(() => {
                expect(result.current.messages.length).toBeGreaterThan(0);
            });

            expect(createNewMessage).toHaveBeenCalled();
        });

        test('應該根據語言設置生成問候語', async () => {
            localStorageMock.getItem.mockImplementation((key) => {
                const mockData = {
                    'userNickname': 'TestUser',
                    'aiPartnerName': 'TestAI', 
                    'preferredLanguage': 'en-US'
                };
                return mockData[key] || null;
            });

            loadChatroomHistoryService.mockResolvedValue({ success: true, content: [] });

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitForHistoryLoaded(result);
            await waitFor(() => {
                expect(result.current.messages.length).toBeGreaterThan(0);
            });

            expect(createNewMessage).toHaveBeenCalled();
        });

        test('應該處理localStorage錯誤', async () => {
            localStorageMock.getItem.mockImplementation(() => {
                throw new Error('localStorage不可用');
            });

            // 應該不會崩潰
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            expect(result.current).toBeDefined();
        });
    });

    describe('addSystemMessage功能', () => {
        test('應該正確添加系統訊息', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            const initialLength = result.current.messages.length;

            act(() => {
                result.current.addSystemMessage('系統測試訊息');
            });

            expect(result.current.messages).toHaveLength(initialLength + 1);
            expect(createNewMessage).toHaveBeenCalledWith(
                expect.any(Number),
                '系統測試訊息',
                false,
                false
            );
        });
    });

    describe('訊息處理和轉換', () => {
        test('應該正確處理重複訊息', async () => {
            const duplicateMessages = [
                { id: '1', text: '訊息1', isUser: true },
                { id: '1', text: '訊息1', isUser: true }, // 重複
            ];
            const uniqueMessages = [{ id: '1', text: '訊息1', isUser: true }];

            loadChatroomHistoryService.mockResolvedValue({ success: true, content: duplicateMessages });
            convertDBMessagesToUIMessages.mockReturnValue(duplicateMessages);
            removeDuplicateMessages.mockReturnValue(uniqueMessages);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitForHistoryLoaded(result);

            expect(convertDBMessagesToUIMessages).toHaveBeenCalledWith(duplicateMessages);
            expect(removeDuplicateMessages).toHaveBeenCalledWith(duplicateMessages);
            expect(result.current.messages).toEqual(uniqueMessages);
        });

        test('應該正確處理轉換錯誤', async () => {
            loadChatroomHistoryService.mockResolvedValue({ success: true, content: [{ id: '1' }] });
            convertDBMessagesToUIMessages.mockImplementation(() => {
                throw new Error('轉換失敗');
            });

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitForHistoryLoaded(result);

            expect(consoleSpies.error).toHaveBeenCalled();
        });
    });

    describe('對話計數和狀態更新', () => {
        test('應該正確計算對話計數', async () => {
            const mockMessages = [
                { id: '1', isUser: true }, 
                { id: '2', isUser: false }, 
                { id: '3', isUser: true }
            ];

            loadChatroomHistoryService.mockResolvedValue({ success: true, content: mockMessages });
            convertDBMessagesToUIMessages.mockReturnValue(mockMessages);
            removeDuplicateMessages.mockReturnValue(mockMessages);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            act(() => {
                result.current.sendTextMessage('新訊息');
            });

            expect(handleSendTextMessage).toHaveBeenCalledWith(
                '新訊息',
                expect.any(Array),
                expect.any(Function),
                expect.any(Function), 
                expect.any(Function),
                'test-chatroom-123',
                expect.any(String),
                3 // 第3條使用者訊息
            );
        });
    });

    describe('清理和記憶體管理', () => {
        test('組件卸載時應該執行清理', () => {
            const { unmount } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            
            // 卸載不應該拋出錯誤
            expect(() => unmount()).not.toThrow();
        });

        test('應該處理AbortController清理', async () => {
            let abortController;
            const originalAbortController = global.AbortController;
            
            global.AbortController = jest.fn(() => {
                abortController = {
                    signal: { aborted: false },
                    abort: jest.fn(() => { abortController.signal.aborted = true; })
                };
                return abortController;
            });

            const { unmount } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            
            unmount();

            global.AbortController = originalAbortController;
        });
    });

    describe('邊界條件測試', () => {
        test('useContext返回null時應該處理', () => {
            useContext.mockReturnValue({ currentChatroomId: null, chatroomLoading: false });

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            expect(result.current).toBeDefined();
            expect(result.current.currentChatroomId).toBeNull();
        });

        test('載入服務返回非預期格式時應該處理', async () => {
            loadChatroomHistoryService.mockResolvedValue({ success: true, content: "非陣列內容" });

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitForHistoryLoaded(result);

            expect(result.current.currentChatroomId).toBe('test-chatroom-123');
        });

        test('應該處理快速狀態變更', async () => {
            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));
            await waitForHistoryLoaded(result);

            // 快速添加多個系統訊息
            act(() => {
                for (let i = 0; i < 5; i++) {
                    result.current.addSystemMessage(`訊息${i}`);
                }
            });

            expect(result.current.messages.length).toBeGreaterThan(0);
        });
    });

    describe('效能測試', () => {
        test('應該能處理大量訊息', async () => {
            const largeMessageArray = Array.from({ length: 100 }, (_, i) => ({
                id: `msg-${i}`,
                text: `訊息 ${i}`,
                isUser: i % 2 === 0,
            }));

            loadChatroomHistoryService.mockResolvedValue({ success: true, content: largeMessageArray });
            convertDBMessagesToUIMessages.mockReturnValue(largeMessageArray);
            removeDuplicateMessages.mockReturnValue(largeMessageArray);

            const { result } = renderHook(() => useChatMessages(mockCanvas, mockSetInputNotification));

            await waitForHistoryLoaded(result);

            expect(result.current.messages).toHaveLength(100);
        });
    });
});