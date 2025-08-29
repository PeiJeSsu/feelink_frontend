import * as ChatAPI from '../helpers/MessageAPI';
import { apiConfig } from '../config/ApiConfig';
import $ from 'jquery';

// Mock dependencies
jest.mock('../config/ApiConfig', () => ({
    apiConfig: {
        defaults: {
            baseURL: 'http://localhost:3000'
        },
        post: jest.fn(),
        get: jest.fn()
    }
}));

jest.mock('jquery', () => ({
    ajax: jest.fn()
}));

describe('ChatAPI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
        // 增加測試超時時間
        jest.setTimeout(10000);
    });

    describe('sendMessageStream', () => {
        it('should create SSE stream with correct parameters', () => {
            $.ajax.mockImplementation(() => ({
                readyState: 4,
                status: 200,
                responseText: 'data: test message\n\n',
                onreadystatechange: null,
                abort: jest.fn()
            }));

            const onToken = jest.fn();
            const onComplete = jest.fn();
            const onError = jest.fn();

            ChatAPI.sendMessageStream('test message', 'chatroom123', onToken, onComplete, onError);

            expect($.ajax).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://localhost:3000/chat',
                    type: 'POST',
                    processData: false,
                    contentType: false,
                    headers: {
                        'Accept': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                    }
                })
            );
        });

        it('should handle SSE data parsing correctly', (done) => {
            let xhrInstance;
            let lastProcessedLength = 0;
            
            $.ajax.mockImplementation(({ xhr }) => {
                // 建立 mock XMLHttpRequest 物件
                xhrInstance = {
                    readyState: 3,
                    status: 200,
                    responseText: '',
                    onreadystatechange: null,
                    abort: jest.fn()
                };
                
                // 執行 xhr 回調函數來設置實例
                const xhrFactory = xhr();
                xhrFactory.onreadystatechange = function() {
                    if (this.readyState === 3 || this.readyState === 4) {
                        if (this.status !== 200) return;
                        
                        const responseText = this.responseText;
                        if (responseText.length > lastProcessedLength) {
                            const newData = responseText.substring(lastProcessedLength);
                            lastProcessedLength = responseText.length;
                            
                            // 模擬 SSE 資料處理邏輯
                            let buffer = newData;
                            const lines = buffer.split('\n');
                            
                            for (const line of lines) {
                                if (line.startsWith('data:')) {
                                    const data = line.substring(5).trim();
                                    if (data.trim()) {
                                        onToken(data);
                                    }
                                }
                            }
                        }
                        
                        if (this.readyState === 4) {
                            onComplete();
                        }
                    }
                };
                
                // 綁定到全域變數以便後續使用
                xhrInstance.onreadystatechange = xhrFactory.onreadystatechange;
                
                return xhrInstance;
            });

            const onToken = jest.fn();
            const onComplete = jest.fn();
            const onError = jest.fn();

            ChatAPI.sendMessageStream('test', 'chatroom123', onToken, onComplete, onError);

            // 模擬 SSE 資料接收
            setTimeout(() => {
                xhrInstance.responseText = 'data: token1\n\n';
                xhrInstance.onreadystatechange();
                
                setTimeout(() => {
                    xhrInstance.responseText = 'data: token1\n\ndata: token2\n\n';
                    xhrInstance.readyState = 4;
                    xhrInstance.onreadystatechange();
                    
                    setTimeout(() => {
                        expect(onToken).toHaveBeenCalledWith('token1');
                        expect(onToken).toHaveBeenCalledWith('token2');
                        expect(onComplete).toHaveBeenCalled();
                        done();
                    }, 10);
                }, 10);
            }, 10);
        });

        it('should handle errors correctly', (done) => {
            let xhrInstance;
            
            $.ajax.mockImplementation(({ xhr }) => {
                xhrInstance = {
                    readyState: 4,
                    status: 500,
                    statusText: 'Internal Server Error',
                    responseText: '',
                    onreadystatechange: null,
                    abort: jest.fn()
                };
                
                const xhrFactory = xhr();
                xhrFactory.onreadystatechange = function() {
                    if (this.readyState === 3 || this.readyState === 4) {
                        if (this.status !== 200) {
                            onError(new Error(`HTTP ${this.status}: ${this.statusText}`));
                            return;
                        }
                    }
                };
                
                xhrInstance.onreadystatechange = xhrFactory.onreadystatechange;
                return xhrInstance;
            });

            const onToken = jest.fn();
            const onComplete = jest.fn();
            const onError = jest.fn();

            ChatAPI.sendMessageStream('test', 'chatroom123', onToken, onComplete, onError);

            setTimeout(() => {
                xhrInstance.onreadystatechange();
                
                setTimeout(() => {
                    expect(onError).toHaveBeenCalledWith(
                        expect.objectContaining({
                            message: 'HTTP 500: Internal Server Error'
                        })
                    );
                    done();
                }, 10);
            }, 10);
        });
    });

    describe('sendImageToBackendStream', () => {
        it('should send image with correct form data', () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            
            $.ajax.mockImplementation(({ xhr, data }) => {
                expect(data).toBeInstanceOf(FormData);
                
                const xhrInstance = {
                    readyState: 4,
                    status: 200,
                    responseText: 'data: analysis result\n\n',
                    onreadystatechange: null,
                    abort: jest.fn()
                };
                
                const xhrFactory = xhr();
                setTimeout(() => {
                    if (xhrFactory.onreadystatechange) {
                        xhrFactory.onreadystatechange();
                    }
                }, 0);
                
                return xhrInstance;
            });

            const onToken = jest.fn();
            const onComplete = jest.fn();
            const onError = jest.fn();

            ChatAPI.sendImageToBackendStream('analyze this', mockFile, 'chatroom123', onToken, onComplete, onError);

            expect($.ajax).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://localhost:3000/analysis',
                    type: 'POST',
                    processData: false,
                    contentType: false
                })
            );
        });
    });

    describe('callAIDrawingAPIStream', () => {
        it('should handle image generation events', (done) => {
            let xhrInstance;
            let lastProcessedLength = 0;
            
            $.ajax.mockImplementation(({ xhr }) => {
                xhrInstance = {
                    readyState: 3,
                    status: 200,
                    responseText: '',
                    onreadystatechange: null,
                    abort: jest.fn()
                };
                
                const xhrFactory = xhr();
                xhrFactory.onreadystatechange = function() {
                    if (this.readyState === 3 || this.readyState === 4) {
                        if (this.status !== 200) return;
                        
                        const responseText = this.responseText;
                        if (responseText.length > lastProcessedLength) {
                            const newData = responseText.substring(lastProcessedLength);
                            lastProcessedLength = responseText.length;
                            
                            // 模擬 SSE 事件處理邏輯
                            let buffer = newData;
                            const lines = buffer.split('\n');
                            
                            for (let i = 0; i < lines.length; i++) {
                                const line = lines[i];
                                if (line.startsWith('event:') && onImageGenerated) {
                                    const eventType = line.substring(6).trim();
                                    if (i + 1 < lines.length) {
                                        const dataLine = lines[i + 1];
                                        if (dataLine.startsWith('data:')) {
                                            const data = dataLine.substring(5).trim();
                                            if (eventType === 'image' && data.trim()) {
                                                onImageGenerated(data);
                                            } else if (eventType === 'complete') {
                                                onComplete();
                                                return;
                                            }
                                            i++; // 跳過已處理的 data 行
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                
                xhrInstance.onreadystatechange = xhrFactory.onreadystatechange;
                return xhrInstance;
            });

            const onToken = jest.fn();
            const onComplete = jest.fn();
            const onError = jest.fn();
            const onImageGenerated = jest.fn();

            ChatAPI.callAIDrawingAPIStream(
                'draw a cat',
                'canvas-data',
                true,
                'chatroom123',
                onToken,
                onComplete,
                onError,
                onImageGenerated
            );

            setTimeout(() => {
                xhrInstance.responseText = 'event: image\ndata: base64imagedata\n\nevent: complete\ndata: \n\n';
                xhrInstance.onreadystatechange();
                
                setTimeout(() => {
                    expect(onImageGenerated).toHaveBeenCalledWith('base64imagedata');
                    expect(onComplete).toHaveBeenCalled();
                    done();
                }, 10);
            }, 10);
        });

        it('should send JSON data with correct structure', () => {
            $.ajax.mockImplementation(({ data, contentType }) => {
                expect(contentType).toBe('application/json');
                const parsedData = JSON.parse(data);
                expect(parsedData).toEqual({
                    text: 'test drawing',
                    imageData: 'canvas-data',
                    removeBackground: false,
                    chatroomId: 'chatroom123'
                });

                return {
                    readyState: 4,
                    status: 200,
                    responseText: '',
                    onreadystatechange: null,
                    abort: jest.fn()
                };
            });

            ChatAPI.callAIDrawingAPIStream(
                'test drawing',
                'canvas-data',
                false,
                'chatroom123',
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn()
            );
        });
    });

    describe('sendMessage', () => {
        it('should send message successfully', async () => {
            const mockResponse = {
                data: {
                    content: 'AI response'
                }
            };

            apiConfig.post.mockResolvedValue(mockResponse);

            const result = await ChatAPI.sendMessage('hello', 1, true, 'chatroom123');

            expect(apiConfig.post).toHaveBeenCalledWith(
                '/chat/simple',
                expect.any(FormData)
            );
            expect(result).toEqual({ content: 'AI response' });
        });

        it('should handle conversation count parameters', async () => {
            const mockResponse = {
                data: {
                    content: 'AI response'
                }
            };

            apiConfig.post.mockResolvedValue(mockResponse);

            await ChatAPI.sendMessage('hello', null, false, 'chatroom123');

            expect(apiConfig.post).toHaveBeenCalledWith(
                '/chat/simple',
                expect.any(FormData)
            );
        });
    });

    describe('callAIDrawingAPI', () => {
        it('should return generated content on success', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    content: 'base64-image-data'
                }
            };

            apiConfig.post.mockResolvedValue(mockResponse);

            const result = await ChatAPI.callAIDrawingAPI('draw cat', 'canvas-data', true, 'chatroom123');

            expect(result).toBe('base64-image-data');
            expect(apiConfig.post).toHaveBeenCalledWith(
                '/generate/simple',
                {
                    text: 'draw cat',
                    imageData: 'canvas-data',
                    removeBackground: true,
                    chatroomId: 'chatroom123',
                    mode: 'drawing'
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        });

        it('should throw error on API failure', async () => {
            const mockResponse = {
                data: {
                    success: false,
                    error: 'Generation failed'
                }
            };

            apiConfig.post.mockResolvedValue(mockResponse);

            await expect(
                ChatAPI.callAIDrawingAPI('draw cat', 'canvas-data', true, 'chatroom123')
            ).rejects.toThrow('Generation failed');
        });
    });

    describe('analysisImage', () => {
        it('should analyze image successfully', async () => {
            const mockResponse = {
                data: {
                    content: 'Analysis result'
                }
            };

            apiConfig.post.mockResolvedValue(mockResponse);

            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const result = await ChatAPI.analysisImage('analyze this', mockFile, 'chatroom123');

            expect(result).toBe('Analysis result');
            expect(apiConfig.post).toHaveBeenCalledWith(
                '/analysis/simple',
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
        });

        it('should handle analysis without file', async () => {
            const mockResponse = {
                data: {
                    content: 'Analysis result'
                }
            };

            apiConfig.post.mockResolvedValue(mockResponse);

            const result = await ChatAPI.analysisImage('analyze this', null, 'chatroom123');

            expect(result).toBe('Analysis result');
        });

        it('should throw error on API failure', async () => {
            const mockError = {
                response: {
                    data: {
                        message: 'Analysis failed'
                    }
                }
            };

            apiConfig.post.mockRejectedValue(mockError);

            await expect(
                ChatAPI.analysisImage('analyze this', null, 'chatroom123')
            ).rejects.toThrow('Analysis failed');
        });
    });

    describe('loadChatroomMessages', () => {
        it('should load chatroom messages successfully', async () => {
            const mockMessages = [
                { id: 1, content: 'Hello', sender: 'user' },
                { id: 2, content: 'Hi there!', sender: 'ai' }
            ];

            apiConfig.get.mockResolvedValue({ data: mockMessages });

            const result = await ChatAPI.loadChatroomMessages('chatroom123');

            expect(result).toEqual(mockMessages);
            expect(apiConfig.get).toHaveBeenCalledWith('/api/messages/chatroom/chatroom123');
        });

        it('should handle loading errors', async () => {
            const mockError = {
                response: {
                    data: {
                        message: 'Chatroom not found'
                    }
                }
            };

            apiConfig.get.mockRejectedValue(mockError);

            await expect(
                ChatAPI.loadChatroomMessages('invalid-id')
            ).rejects.toThrow('Chatroom not found');
        });
    });

    describe('loadChatroomTextMessages', () => {
        it('should load text messages successfully', async () => {
            const mockMessages = [
                { id: 1, content: 'Hello', type: 'text' }
            ];

            apiConfig.get.mockResolvedValue({ data: mockMessages });

            const result = await ChatAPI.loadChatroomTextMessages('chatroom123');

            expect(result).toEqual(mockMessages);
            expect(apiConfig.get).toHaveBeenCalledWith('/api/messages/chatroom/chatroom123/text');
        });
    });

    describe('loadChatroomDrawingMessages', () => {
        it('should load drawing messages successfully', async () => {
            const mockMessages = [
                { id: 1, content: 'base64-drawing-data', type: 'drawing' }
            ];

            apiConfig.get.mockResolvedValue({ data: mockMessages });

            const result = await ChatAPI.loadChatroomDrawingMessages('chatroom123');

            expect(result).toEqual(mockMessages);
            expect(apiConfig.get).toHaveBeenCalledWith('/api/messages/chatroom/chatroom123/drawing');
        });
    });

    describe('loadUserMessages', () => {
        it('should load user messages successfully', async () => {
            const mockMessages = [
                { id: 1, content: 'Hello', sender: 'user' }
            ];

            apiConfig.get.mockResolvedValue({ data: mockMessages });

            const result = await ChatAPI.loadUserMessages('chatroom123');

            expect(result).toEqual(mockMessages);
            expect(apiConfig.get).toHaveBeenCalledWith('/api/messages/chatroom/chatroom123/user');
        });
    });

    describe('loadAIMessages', () => {
        it('should load AI messages successfully', async () => {
            const mockMessages = [
                { id: 1, content: 'Hi there!', sender: 'ai' }
            ];

            apiConfig.get.mockResolvedValue({ data: mockMessages });

            const result = await ChatAPI.loadAIMessages('chatroom123');

            expect(result).toEqual(mockMessages);
            expect(apiConfig.get).toHaveBeenCalledWith('/api/messages/chatroom/chatroom123/ai');
        });
    });

    describe('SSE Buffer Management', () => {
        it('should handle partial SSE messages correctly', (done) => {
            let xhrInstance;
            let currentResponseLength = 0;
            let buffer = '';
            
            $.ajax.mockImplementation(({ xhr }) => {
                xhrInstance = {
                    get readyState() { return 3; },
                    get status() { return 200; },
                    responseText: '',
                    onreadystatechange: null,
                    abort: jest.fn()
                };
                
                const xhrFactory = xhr();
                xhrFactory.onreadystatechange = function() {
                    if (this.readyState === 3 || this.readyState === 4) {
                        if (this.status !== 200) return;
                        
                        const responseText = this.responseText;
                        if (responseText.length > currentResponseLength) {
                            const newData = responseText.substring(currentResponseLength);
                            currentResponseLength = responseText.length;
                            buffer += newData;
                            
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';
                            
                            for (const line of lines) {
                                if (line.startsWith('data:')) {
                                    const data = line.substring(5).trim();
                                    if (data.trim()) {
                                        onToken(data);
                                    }
                                }
                            }
                        }
                    }
                };
                
                xhrInstance.onreadystatechange = xhrFactory.onreadystatechange;
                return xhrInstance;
            });

            const onToken = jest.fn();
            const onComplete = jest.fn();
            const onError = jest.fn();

            ChatAPI.sendMessageStream('test', 'chatroom123', onToken, onComplete, onError);

            // 模擬分段接收數據
            setTimeout(() => {
                xhrInstance.responseText = 'data: partial';
                xhrInstance.onreadystatechange();
            }, 5);

            setTimeout(() => {
                xhrInstance.responseText = 'data: partial message\n\n';
                xhrInstance.onreadystatechange();
                
                setTimeout(() => {
                    expect(onToken).toHaveBeenCalledWith('partial message');
                    expect(onToken).toHaveBeenCalledTimes(1);
                    done();
                }, 10);
            }, 10);
        });

        it('should handle multiple events in single response', (done) => {
            let xhrInstance;
            let lastProcessedLength = 0;
            
            $.ajax.mockImplementation(({ xhr }) => {
                xhrInstance = {
                    readyState: 3,
                    status: 200,
                    responseText: '',
                    onreadystatechange: null,
                    abort: jest.fn()
                };
                
                const xhrFactory = xhr();
                xhrFactory.onreadystatechange = function() {
                    if (this.readyState === 3 || this.readyState === 4) {
                        if (this.status !== 200) return;
                        
                        const responseText = this.responseText;
                        if (responseText.length > lastProcessedLength) {
                            const newData = responseText.substring(lastProcessedLength);
                            lastProcessedLength = responseText.length;
                            
                            let buffer = newData;
                            const lines = buffer.split('\n');
                            
                            for (let i = 0; i < lines.length; i++) {
                                const line = lines[i];
                                if (line.startsWith('event:') && onImageGenerated) {
                                    const eventType = line.substring(6).trim();
                                    if (i + 1 < lines.length) {
                                        const dataLine = lines[i + 1];
                                        if (dataLine.startsWith('data:')) {
                                            const data = dataLine.substring(5).trim();
                                            if (eventType === 'image' && data.trim()) {
                                                onImageGenerated(data);
                                            } else if (eventType === 'complete') {
                                                onComplete();
                                                return;
                                            }
                                            i++; // 跳過已處理的 data 行
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                
                xhrInstance.onreadystatechange = xhrFactory.onreadystatechange;
                return xhrInstance;
            });

            const onToken = jest.fn();
            const onComplete = jest.fn();
            const onError = jest.fn();
            const onImageGenerated = jest.fn();

            ChatAPI.callAIDrawingAPIStream(
                'test',
                'canvas-data',
                true,
                'chatroom123',
                onToken,
                onComplete,
                onError,
                onImageGenerated
            );

            setTimeout(() => {
                xhrInstance.responseText = 'event: image\ndata: img1\n\nevent: image\ndata: img2\n\nevent: complete\ndata: \n\n';
                xhrInstance.onreadystatechange();
                
                setTimeout(() => {
                    expect(onImageGenerated).toHaveBeenCalledWith('img1');
                    expect(onImageGenerated).toHaveBeenCalledWith('img2');
                    expect(onImageGenerated).toHaveBeenCalledTimes(2);
                    expect(onComplete).toHaveBeenCalled();
                    done();
                }, 10);
            }, 10);
        });
    });
});