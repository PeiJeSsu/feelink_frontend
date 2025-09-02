import { handleError } from '../helpers/usage/MessageError';
import { createNewMessage, getNewId } from '../helpers/usage/MessageFactory';

// Mock MessageFactory functions
jest.mock('../helpers/usage/MessageFactory', () => ({
  createNewMessage: jest.fn(),
  getNewId: jest.fn(),
}));

describe('handleError', () => {
  let mockSetMessages;
  let mockMessages;
  let mockError;
  let consoleErrorSpy;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock setMessages function
    mockSetMessages = jest.fn();
    
    // Mock messages array
    mockMessages = [
      { id: 1, content: 'Message 1' },
      { id: 2, content: 'Message 2' }
    ];
    
    // Mock error object
    mockError = new Error('Test error message');
    
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock MessageFactory functions
    getNewId.mockReturnValue(2);
    createNewMessage.mockReturnValue({
      id: 3,
      content: '抱歉，處理訊息時發生錯誤。',
      isUser: false,
      isLoading: false
    });
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('should log error with correct prefix', () => {
    const errorPrefix = 'API Error';
    
    handleError(mockError, errorPrefix, mockMessages, mockSetMessages);
    
    expect(console.error).toHaveBeenCalledWith('API Error:', mockError);
  });

  test('should call getNewId with messages array', () => {
    const errorPrefix = 'Network Error';
    
    handleError(mockError, errorPrefix, mockMessages, mockSetMessages);
    
    expect(getNewId).toHaveBeenCalledWith(mockMessages);
  });

  test('should call createNewMessage with correct parameters', () => {
    const errorPrefix = 'Validation Error';
    
    handleError(mockError, errorPrefix, mockMessages, mockSetMessages);
    
    expect(createNewMessage).toHaveBeenCalledWith(
      3, // getNewId(messages) + 1 = 2 + 1 = 3
      '抱歉，處理訊息時發生錯誤。',
      false,
      false
    );
  });

  test('should call setMessages with function that adds error message', () => {
    const errorPrefix = 'Processing Error';
    const mockErrorMessage = {
      id: 3,
      content: '抱歉，處理訊息時發生錯誤。',
      isUser: false,
      isLoading: false
    };
    
    createNewMessage.mockReturnValue(mockErrorMessage);
    
    handleError(mockError, errorPrefix, mockMessages, mockSetMessages);
    
    expect(mockSetMessages).toHaveBeenCalledWith(expect.any(Function));
    
    // Test the function passed to setMessages
    const setMessagesCallback = mockSetMessages.mock.calls[0][0];
    const prevMessages = [{ id: 1, content: 'Previous message' }];
    const result = setMessagesCallback(prevMessages);
    
    expect(result).toEqual([...prevMessages, mockErrorMessage]);
  });

  test('should handle different error types', () => {
    const stringError = 'String error';
    const errorPrefix = 'String Error';
    
    handleError(stringError, errorPrefix, mockMessages, mockSetMessages);
    
    expect(console.error).toHaveBeenCalledWith('String Error:', stringError);
    expect(getNewId).toHaveBeenCalledWith(mockMessages);
    expect(createNewMessage).toHaveBeenCalled();
    expect(mockSetMessages).toHaveBeenCalled();
  });

  test('should handle empty messages array', () => {
    const emptyMessages = [];
    const errorPrefix = 'Empty Array Error';
    
    getNewId.mockReturnValue(-1); // Simulate empty array scenario
    
    handleError(mockError, errorPrefix, emptyMessages, mockSetMessages);
    
    expect(getNewId).toHaveBeenCalledWith(emptyMessages);
    expect(createNewMessage).toHaveBeenCalledWith(
      0, // -1 + 1 = 0
      '抱歉，處理訊息時發生錯誤。',
      false,
      false
    );
  });

  test('should handle null or undefined error', () => {
    const errorPrefix = 'Null Error';
    
    handleError(null, errorPrefix, mockMessages, mockSetMessages);
    
    expect(console.error).toHaveBeenCalledWith('Null Error:', null);
    expect(mockSetMessages).toHaveBeenCalled();
  });

  test('should maintain immutability when adding error message', () => {
    const errorPrefix = 'Immutability Test';
    const originalMessages = [{ id: 1, content: 'Original' }];
    const mockErrorMessage = { id: 2, content: 'Error' };
    
    createNewMessage.mockReturnValue(mockErrorMessage);
    
    handleError(mockError, errorPrefix, originalMessages, mockSetMessages);
    
    const setMessagesCallback = mockSetMessages.mock.calls[0][0];
    const result = setMessagesCallback(originalMessages);
    
    // Original array should not be modified
    expect(originalMessages).toEqual([{ id: 1, content: 'Original' }]);
    // New array should contain both original and error message
    expect(result).toEqual([
      { id: 1, content: 'Original' },
      mockErrorMessage
    ]);
  });

  test('should work with different error prefix formats', () => {
    const testCases = [
      'Simple Error',
      'API_ERROR',
      'error-with-dashes',
      'Error 404',
      '錯誤前綴', // Chinese prefix
      ''
    ];

    testCases.forEach(prefix => {
      jest.clearAllMocks();
      
      handleError(mockError, prefix, mockMessages, mockSetMessages);
      
      expect(console.error).toHaveBeenCalledWith(`${prefix}:`, mockError);
      expect(mockSetMessages).toHaveBeenCalled();
    });
  });
});

// Integration test to verify the complete flow
describe('handleError integration', () => {
  test('should complete the full error handling flow without throwing errors', () => {
    const realError = new Error('Real integration test error');
    const errorPrefix = 'Integration Test';
    const messages = [{ id: 1 }, { id: 2 }];
    const setMessages = jest.fn();
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Test that the function completes without throwing
    expect(() => {
      handleError(realError, errorPrefix, messages, setMessages);
    }).not.toThrow();
    
    // Verify that console.error was called
    expect(console.error).toHaveBeenCalledWith('Integration Test:', realError);
    
    // Verify that setMessages was called
    expect(setMessages).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  test('should handle the complete flow with edge cases', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Test with minimal parameters
    const setMessages = jest.fn();
    
    expect(() => {
      handleError(undefined, '', [], setMessages);
    }).not.toThrow();
    
    expect(console.error).toHaveBeenCalledWith(':', undefined);
    expect(setMessages).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});