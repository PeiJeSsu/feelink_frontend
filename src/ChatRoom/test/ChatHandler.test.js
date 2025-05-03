import {
    isValidMessage,
    handleSendText,
    handleSendImage,
    handleMessageChange,
    handleImageChange,
    handleAnalyzeCanvas,
    handleAIDrawing
  } from '../helpers/HandleTextInput';
  
  describe('ChatHandler 功能測試', () => {
    // isValidMessage 測試
    describe('isValidMessage', () => {
      it('應該驗證非空白訊息為有效', () => {
        expect(isValidMessage('Hello')).toBe(true);
        expect(isValidMessage('  Hello  ')).toBe(true);
      });
  
      it('應該驗證空白訊息為無效', () => {
        expect(isValidMessage('')).toBe(false);
        expect(isValidMessage('  ')).toBe(false);
      });
    });
  
    // handleSendText 測試
    describe('handleSendText', () => {
      it('有效訊息時應發送並清空輸入', () => {
        const mockOnSendMessage = jest.fn();
        const mockSetMessage = jest.fn();
        const message = 'Hello World';
        const disabled = false;
  
        handleSendText(message, mockSetMessage, mockOnSendMessage, disabled);
  
        expect(mockOnSendMessage).toHaveBeenCalledWith(message);
        expect(mockSetMessage).toHaveBeenCalledWith('');
      });
  
      it('無效訊息時不應發送', () => {
        const mockOnSendMessage = jest.fn();
        const mockSetMessage = jest.fn();
        const message = '  ';
        const disabled = false;
  
        handleSendText(message, mockSetMessage, mockOnSendMessage, disabled);
  
        expect(mockOnSendMessage).not.toHaveBeenCalled();
        expect(mockSetMessage).not.toHaveBeenCalled();
      });
  
      it('禁用狀態時不應發送', () => {
        const mockOnSendMessage = jest.fn();
        const mockSetMessage = jest.fn();
        const message = 'Hello World';
        const disabled = true;
  
        handleSendText(message, mockSetMessage, mockOnSendMessage, disabled);
  
        expect(mockOnSendMessage).not.toHaveBeenCalled();
        expect(mockSetMessage).not.toHaveBeenCalled();
      });
    });
  
    // handleSendImage 測試
    describe('handleSendImage', () => {
      it('應觸發隱藏的圖片上傳元素', () => {
        const mockRef = {
          current: {
            click: jest.fn()
          }
        };
  
        handleSendImage(mockRef);
  
        expect(mockRef.current.click).toHaveBeenCalled();
      });
    });
  
    // handleMessageChange 測試
    describe('handleMessageChange', () => {
      it('應更新訊息狀態', () => {
        const mockSetMessage = jest.fn();
        const mockEvent = {
          target: {
            value: 'New message'
          }
        };
  
        handleMessageChange(mockEvent, mockSetMessage);
  
        expect(mockSetMessage).toHaveBeenCalledWith('New message');
      });
    });
  
    // handleImageChange 測試
    describe('handleImageChange', () => {
      it('有效圖片檔案時應上傳並清空輸入', () => {
        const mockOnUploadImage = jest.fn();
        const mockSetMessage = jest.fn();
        const message = 'Image caption';
        const mockFile = { type: 'image/jpeg' };
        const mockEvent = {
          target: {
            files: [mockFile],
            value: 'C:\\fakepath\\image.jpg'
          }
        };
  
        handleImageChange(mockEvent, message, mockSetMessage, mockOnUploadImage);
  
        expect(mockOnUploadImage).toHaveBeenCalledWith(message, mockFile);
        expect(mockSetMessage).toHaveBeenCalledWith('');
        expect(mockEvent.target.value).toBe('');
      });
  
      it('無效檔案類型時不應處理', () => {
        const mockOnUploadImage = jest.fn();
        const mockSetMessage = jest.fn();
        const message = 'Document caption';
        const mockFile = { type: 'application/pdf' };
        const mockEvent = {
          target: {
            files: [mockFile],
            value: 'C:\\fakepath\\document.pdf'
          }
        };
  
        handleImageChange(mockEvent, message, mockSetMessage, mockOnUploadImage);
  
        expect(mockOnUploadImage).not.toHaveBeenCalled();
        expect(mockSetMessage).not.toHaveBeenCalled();
        expect(mockEvent.target.value).toBe('C:\\fakepath\\document.pdf');
      });
  
      it('沒有檔案時不應處理', () => {
        const mockOnUploadImage = jest.fn();
        const mockSetMessage = jest.fn();
        const message = 'No file';
        const mockEvent = {
          target: {
            files: [],
            value: ''
          }
        };
  
        handleImageChange(mockEvent, message, mockSetMessage, mockOnUploadImage);
  
        expect(mockOnUploadImage).not.toHaveBeenCalled();
        expect(mockSetMessage).not.toHaveBeenCalled();
      });
    });
  
    // handleAnalyzeCanvas 測試
    describe('handleAnalyzeCanvas', () => {
      it('有回調函數時應分析畫布並清空輸入', () => {
        const mockOnAnalyzeCanvas = jest.fn();
        const mockSetMessage = jest.fn();
        const message = 'Analyze this canvas';
  
        handleAnalyzeCanvas(message, mockSetMessage, mockOnAnalyzeCanvas);
  
        expect(mockOnAnalyzeCanvas).toHaveBeenCalledWith(message);
        expect(mockSetMessage).toHaveBeenCalledWith('');
      });
  
      it('沒有回調函數時不應執行任何操作', () => {
        const mockSetMessage = jest.fn();
        const message = 'Analyze this canvas';
  
        handleAnalyzeCanvas(message, mockSetMessage, null);
  
        expect(mockSetMessage).not.toHaveBeenCalled();
      });
    });
  
    // handleAIDrawing 測試
    describe('handleAIDrawing', () => {
      it('有回調函數時應執行 AI 繪圖並清空輸入', () => {
        const mockOnAIDrawing = jest.fn();
        const mockSetMessage = jest.fn();
        const message = 'Draw a cat';
  
        handleAIDrawing(message, mockSetMessage, mockOnAIDrawing);
  
        expect(mockOnAIDrawing).toHaveBeenCalledWith(message);
        expect(mockSetMessage).toHaveBeenCalledWith('');
      });
  
      it('沒有回調函數時不應執行任何操作', () => {
        const mockSetMessage = jest.fn();
        const message = 'Draw a cat';
  
        handleAIDrawing(message, mockSetMessage, null);
  
        expect(mockSetMessage).not.toHaveBeenCalled();
      });
    });
  });