// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe(target) {
    this.callback([{ target }], this);
  }
  
  unobserve(target) {
    console.log(`已取消觀察目標: ${target}`);
  }
  
  disconnect() {
    console.log('已中斷所有觀察');
  }
};
  global.crypto = {
    randomUUID: jest.fn(() => "mocked-user-id-123"),
  };