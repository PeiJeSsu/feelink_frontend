import { setupHistoryEventListeners } from "../HistoryEventListeners";

describe("setupHistoryEventListeners", () => {
	let canvas, onStateChange, isUndoRedoing;
	beforeEach(() => {
		onStateChange = jest.fn();
		isUndoRedoing = jest.fn(() => false);
		canvas = {
			on: jest.fn(),
			off: jest.fn(),
			isClearingAll: false,
		};
	});

	it("canvas 為 null 時應回傳清理函數", () => {
		const cleanup = setupHistoryEventListeners(null, onStateChange, isUndoRedoing);
		expect(typeof cleanup).toBe("function");
		cleanup(); // 不應報錯
	});

	it("應註冊四個事件監聽器並回傳清理函數", () => {
		const cleanup = setupHistoryEventListeners(canvas, onStateChange, isUndoRedoing);
		expect(canvas.on).toHaveBeenCalledTimes(4);
		expect(typeof cleanup).toBe("function");
		cleanup();
		expect(canvas.off).toHaveBeenCalledTimes(4);
	});

	it("object:modified 事件應觸發 onStateChange", () => {
		const cleanup = setupHistoryEventListeners(canvas, onStateChange, isUndoRedoing);
		// 取得 object:modified callback
		const cb = canvas.on.mock.calls.find(([event]) => event === "object:modified")[1];
		cb({ target: { type: "rect" } });
		expect(onStateChange).toHaveBeenCalled();
		cleanup();
	});

	it("object:modified 事件遇到 eraser indicator 不觸發 onStateChange", () => {
		const cleanup = setupHistoryEventListeners(canvas, onStateChange, isUndoRedoing);
		const cb = canvas.on.mock.calls.find(([event]) => event === "object:modified")[1];
		cb({ target: { type: "circle", fill: "rgba(255, 0, 0, 0.3)" } });
		expect(onStateChange).not.toHaveBeenCalled();
		cleanup();
	});

	it("object:modified 事件 isUndoRedoing 為 true 不觸發 onStateChange", () => {
		isUndoRedoing = jest.fn(() => true);
		const cleanup = setupHistoryEventListeners(canvas, onStateChange, isUndoRedoing);
		const cb = canvas.on.mock.calls.find(([event]) => event === "object:modified")[1];
		cb({ target: { type: "rect" } });
		expect(onStateChange).not.toHaveBeenCalled();
		cleanup();
	});

	it("object:removed 事件 isClearingAll 為 true 不觸發 onStateChange", () => {
		canvas.isClearingAll = true;
		const cleanup = setupHistoryEventListeners(canvas, onStateChange, isUndoRedoing);
		const cb = canvas.on.mock.calls.find(([event]) => event === "object:removed")[1];
		cb({ target: { type: "rect" } });
		expect(onStateChange).not.toHaveBeenCalled();
		cleanup();
	});
});
