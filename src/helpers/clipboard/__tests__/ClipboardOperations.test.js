import * as ClipboardOperations from "../ClipboardOperations";
import * as fabric from "fabric";

jest.mock('fabric', () => ({
	ActiveSelection: jest.fn().mockImplementation((objects, options) => ({
		objects,
		canvas: options.canvas,
	}))
}));

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
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const errorCanvas = {
			...canvas,
			discardActiveObject: jest.fn(() => { throw new Error('Test error'); }),
		};
		await ClipboardOperations.paste(errorCanvas);
		expect(consoleErrorSpy).toHaveBeenCalledWith("貼上失敗:", expect.any(Error));
		consoleErrorSpy.mockRestore();
	});

	it("cut: 多物件剪下", async () => {
		const fabric = jest.requireActual('fabric');
		
		// 創建一個真正的 ActiveSelection 類型的物件
		const activeSelection = new fabric.ActiveSelection([], {
			left: 10,
			top: 20,
		});
		
		// Mock 必要的方法
		activeSelection.clone = jest.fn().mockResolvedValue({
			set: jest.fn(),
			clone: jest.fn().mockResolvedValue({ set: jest.fn(), clone: jest.fn() }),
		});
		
		activeSelection.forEachObject = jest.fn((callback) => {
			callback({ id: 'obj1' });
			callback({ id: 'obj2' });
		});
		
		canvas.getActiveObject.mockReturnValue(activeSelection);
		canvas.discardActiveObject.mockClear();
		canvas.remove.mockClear();
		canvas.requestRenderAll.mockClear();
		
		await ClipboardOperations.cut(canvas);
		expect(activeSelection.clone).toHaveBeenCalled();
		expect(canvas.discardActiveObject).toHaveBeenCalled();
		expect(canvas.remove).toHaveBeenCalledTimes(2);
		expect(canvas.remove).toHaveBeenCalledWith({ id: 'obj1' });
		expect(canvas.remove).toHaveBeenCalledWith({ id: 'obj2' });
		expect(canvas.requestRenderAll).toHaveBeenCalled();
		expect(ClipboardOperations.hasClipboardContent()).toBe(true);
	});

	it("paste: 多物件貼上", async () => {
		const fabric = require('fabric');
		jest.clearAllMocks();
		const mockClonedActiveSelection = {
			type: 'activeSelection', 
			set: jest.fn(),
			forEachObject: jest.fn((callback) => {
				callback({ id: 'obj1' });
				callback({ id: 'obj2' });
			}),
			setCoords: jest.fn(),
			canvas: null,
		};
		Object.setPrototypeOf(mockClonedActiveSelection, fabric.ActiveSelection.prototype);
		const mockOriginalSelection = {
			left: 5,
			top: 5,
			clone: jest.fn().mockImplementation(async () => {
				return {
					...mockClonedActiveSelection,
					clone: jest.fn().mockResolvedValue(mockClonedActiveSelection)
				};
			}),
		};
		Object.setPrototypeOf(mockOriginalSelection, fabric.ActiveSelection.prototype);
		canvas.getActiveObject.mockReturnValue(mockOriginalSelection);
		await ClipboardOperations.copy(canvas);
		canvas.discardActiveObject = jest.fn();
		canvas.add = jest.fn();
		canvas.setActiveObject = jest.fn();
		canvas.requestRenderAll = jest.fn();
		await ClipboardOperations.paste(canvas);
		expect(mockClonedActiveSelection.set).toHaveBeenCalledWith({
			left: 15,
			top: 15,
			evented: true,
		});
		expect(mockClonedActiveSelection.forEachObject).toHaveBeenCalled();
		expect(mockClonedActiveSelection.setCoords).toHaveBeenCalled();
		expect(canvas.add).toHaveBeenCalledTimes(2);
		expect(canvas.add).toHaveBeenCalledWith({ id: 'obj1' });
		expect(canvas.add).toHaveBeenCalledWith({ id: 'obj2' });
		expect(fabric.ActiveSelection).toHaveBeenCalledWith(
			[{ id: 'obj1' }, { id: 'obj2' }], 
			{ canvas }
		);
		expect(canvas.setActiveObject).toHaveBeenCalled();
		expect(canvas.requestRenderAll).toHaveBeenCalled();
	});
});
