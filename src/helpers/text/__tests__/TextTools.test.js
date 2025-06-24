import * as TextTools from "../TextTools";

const mockTextbox = { enterEditing: jest.fn() };
jest.mock("fabric", () => ({
	Textbox: jest.fn(() => mockTextbox),
}));

describe("TextTools", () => {
	let canvas;
	let settings;
	beforeEach(() => {
		settings = { fontFamily: "Arial", fontSize: 20, fill: "#000" };
		canvas = {
			isDrawingMode: false,
			selection: false,
			defaultCursor: "",
			off: jest.fn(),
			on: jest.fn(),
			setActiveObject: jest.fn(),
			requestRenderAll: jest.fn(),
			add: jest.fn(),
			getPointer: jest.fn(() => ({ x: 10, y: 20 })),
			getActiveObject: jest.fn(),
			historyManager: { saveState: jest.fn() },
		};
		mockTextbox.enterEditing.mockClear();
	});

	describe("setupTextTool", () => {
		it("canvas 為 null 時應直接 return", () => {
			expect(TextTools.setupTextTool(null, settings)).toBeUndefined();
		});
		it("應設置基本屬性並註冊 mouse:down", () => {
			TextTools.setupTextTool(canvas, settings);
			expect(canvas.isDrawingMode).toBe(false);
			expect(canvas.selection).toBe(true);
			expect(canvas.defaultCursor).toBe("text");
			expect(canvas.off).toHaveBeenCalledWith("mouse:down");
			expect(canvas.on).toHaveBeenCalledWith("mouse:down", expect.any(Function));
		});
		it("點擊 textbox 物件應進入編輯模式", () => {
			TextTools.setupTextTool(canvas, settings);
			// 取得 mouse:down callback
			const cb = canvas.on.mock.calls.find(([event]) => event === "mouse:down")[1];
			const target = { type: "textbox", enterEditing: jest.fn() };
			cb({ target });
			expect(canvas.setActiveObject).toHaveBeenCalledWith(target);
			expect(target.enterEditing).toHaveBeenCalled();
			expect(canvas.requestRenderAll).toHaveBeenCalled();
		});
		it("點擊其他物件不應建立新 textbox", () => {
			TextTools.setupTextTool(canvas, settings);
			const cb = canvas.on.mock.calls.find(([event]) => event === "mouse:down")[1];
			const target = { type: "rect" };
			expect(cb({ target })).toBeUndefined();
		});
		it("點擊空白處應建立新 textbox 並進入編輯", () => {
			const mockTextbox = { enterEditing: jest.fn() };
			jest.spyOn(require("fabric"), "Textbox").mockImplementation(() => mockTextbox);
			TextTools.setupTextTool(canvas, settings);
			const cb = canvas.on.mock.calls.find(([event]) => event === "mouse:down")[1];
			cb({ target: null, e: {} });
			expect(canvas.add).toHaveBeenCalledWith(mockTextbox);
			expect(canvas.setActiveObject).toHaveBeenCalledWith(mockTextbox);
			expect(mockTextbox.enterEditing).toHaveBeenCalled();
			expect(canvas.requestRenderAll).toHaveBeenCalled();
		});
		it("建立新 textbox 時有 historyManager 應 saveState", (done) => {
			const mockTextbox = { enterEditing: jest.fn() };
			jest.spyOn(require("fabric"), "Textbox").mockImplementation(() => mockTextbox);
			TextTools.setupTextTool(canvas, settings);
			const cb = canvas.on.mock.calls.find(([event]) => event === "mouse:down")[1];
			cb({ target: null, e: {} });
			setTimeout(() => {
				expect(canvas.historyManager.saveState).toHaveBeenCalled();
				done();
			}, 10);
		});
	});

	describe("updateActiveTextbox", () => {
		it("canvas 為 null 時應直接 return", () => {
			expect(TextTools.updateActiveTextbox(null, settings)).toBeUndefined();
		});
		it("無 activeObject 或非 textbox 時應直接 return", () => {
			canvas.getActiveObject.mockReturnValue(null);
			expect(TextTools.updateActiveTextbox(canvas, settings)).toBeUndefined();
			canvas.getActiveObject.mockReturnValue({ type: "rect" });
			expect(TextTools.updateActiveTextbox(canvas, settings)).toBeUndefined();
		});
		it("應正確更新 textbox 屬性並維持編輯狀態", () => {
			const textbox = {
				type: "textbox",
				isEditing: true,
				exitEditing: jest.fn(),
				enterEditing: jest.fn(),
				set: jest.fn(),
			};
			canvas.getActiveObject.mockReturnValue(textbox);
			TextTools.updateActiveTextbox(canvas, settings);
			expect(textbox.exitEditing).toHaveBeenCalled();
			expect(textbox.set).toHaveBeenCalledWith({
				fontFamily: settings.fontFamily,
				fontSize: settings.fontSize,
				fill: settings.fill,
				cursorColor: settings.fill,
			});
			expect(textbox.enterEditing).toHaveBeenCalled();
			expect(canvas.requestRenderAll).toHaveBeenCalled();
		});
		it("未處於編輯狀態時不呼叫 exit/enterEditing", () => {
			const textbox = {
				type: "textbox",
				isEditing: false,
				exitEditing: jest.fn(),
				enterEditing: jest.fn(),
				set: jest.fn(),
			};
			canvas.getActiveObject.mockReturnValue(textbox);
			TextTools.updateActiveTextbox(canvas, settings);
			expect(textbox.exitEditing).not.toHaveBeenCalled();
			expect(textbox.enterEditing).not.toHaveBeenCalled();
			expect(textbox.set).toHaveBeenCalled();
			expect(canvas.requestRenderAll).toHaveBeenCalled();
		});
	});
});
