import * as ClipboardOperations from "../ClipboardOperations";

describe("ClipboardOperations", () => {
	let canvas, obj;
	beforeEach(() => {
		obj = {
			left: 10,
			top: 20,
			clone: jest.fn().mockResolvedValue({
				set: jest.fn(),
				clone: jest.fn().mockResolvedValue({ set: jest.fn(), clone: jest.fn() }),
			}),
		};
		canvas = {
			getActiveObject: jest.fn(() => obj),
			remove: jest.fn(),
			requestRenderAll: jest.fn(),
			discardActiveObject: jest.fn(),
			add: jest.fn(),
			setActiveObject: jest.fn(),
		};
	});

	it("cut: 沒有 activeObject 不動作", async () => {
		canvas.getActiveObject.mockReturnValue(null);
		await ClipboardOperations.cut(canvas);
		expect(canvas.remove).not.toHaveBeenCalled();
	});

	it("cut: 正常剪下", async () => {
		await ClipboardOperations.cut(canvas);
		expect(obj.clone).toHaveBeenCalled();
		expect(canvas.remove).toHaveBeenCalledWith(obj);
		expect(canvas.requestRenderAll).toHaveBeenCalled();
		expect(ClipboardOperations.hasClipboardContent()).toBe(true);
	});

	it("copy: 沒有 activeObject 不動作", async () => {
		canvas.getActiveObject.mockReturnValue(null);
		await ClipboardOperations.copy(canvas);
		expect(ClipboardOperations.hasClipboardContent()).toBe(false);
	});

	it("copy: 正常複製", async () => {
		await ClipboardOperations.copy(canvas);
		expect(obj.clone).toHaveBeenCalled();
		expect(ClipboardOperations.hasClipboardContent()).toBe(true);
	});

	it("paste: 沒有 clipboard 不動作", async () => {
		await ClipboardOperations.paste(canvas);
		expect(canvas.add).not.toHaveBeenCalled();
	});

	it("paste: 正常貼上", async () => {
		await ClipboardOperations.copy(canvas);
		await ClipboardOperations.paste(canvas);
		expect(canvas.add).toHaveBeenCalled();
		expect(canvas.setActiveObject).toHaveBeenCalled();
		expect(canvas.requestRenderAll).toHaveBeenCalled();
	});

	it("paste: 貼上失敗時應捕捉錯誤", async () => {
		await ClipboardOperations.copy(canvas);
		const errorObj = { clone: jest.fn().mockRejectedValue(new Error("fail")), set: jest.fn() };
		// 模擬 clipboard 內容
		await ClipboardOperations.paste({
			...canvas,
			add: jest.fn(),
			setActiveObject: jest.fn(),
			requestRenderAll: jest.fn(),
			discardActiveObject: jest.fn(),
		});
	});
});
