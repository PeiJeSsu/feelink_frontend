let showAlert;

describe("AlertUtils", () => {
	let originalCreateElement;
	let originalAppendChild;
	let originalRemoveChild;
	let originalContains;
	let alertContainer;
	let mockRender;
	let mockUnmount;

	beforeEach(() => {
		jest.resetModules();
		// 重新 mock react-dom/client 並注入 mockRender/mockUnmount
		mockRender = jest.fn();
		mockUnmount = jest.fn();
		jest.doMock("react-dom/client", () => ({
			createRoot: jest.fn(() => ({
				render: mockRender,
				unmount: mockUnmount,
			})),
		}));
		// 重新 import showAlert 以套用 mock
		showAlert = require("../AlertUtils").showAlert;

		// Mock DOM 操作
		alertContainer = {};
		originalCreateElement = document.createElement;
		originalAppendChild = document.body.appendChild;
		originalRemoveChild = document.body.removeChild;
		originalContains = document.body.contains;
		document.createElement = jest.fn(() => alertContainer);
		document.body.appendChild = jest.fn();
		document.body.removeChild = jest.fn();
		document.body.contains = jest.fn(() => true);
		jest.useFakeTimers();
	});

	afterEach(() => {
		document.createElement = originalCreateElement;
		document.body.appendChild = originalAppendChild;
		document.body.removeChild = originalRemoveChild;
		document.body.contains = originalContains;
		jest.clearAllTimers();
		jest.useRealTimers();
		jest.resetModules();
	});

	it("應該能正確顯示 alert 並自動清理", () => {
		showAlert("訊息", "success", 1000);
		expect(document.body.appendChild).toHaveBeenCalledWith(alertContainer);
		// 檢查 render 被呼叫
		expect(mockRender).toHaveBeenCalled();
		// 快轉時間觸發清理
		jest.advanceTimersByTime(1000);
		expect(document.body.removeChild).toHaveBeenCalledWith(alertContainer);
		expect(mockUnmount).toHaveBeenCalled();
	});
});
