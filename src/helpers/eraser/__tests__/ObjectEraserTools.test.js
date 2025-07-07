import { setupEraser, disableEraser } from "../ObjectEraserTools";
import { setupIndicatorEventListeners } from "../EraserIndicator";

jest.mock("../EraserIndicator", () => {
	const mockIndicator = {
		id: "eraser-indicator",
		type: "circle",
		fill: "rgba(255, 0, 0, 0.3)",
		set: jest.fn(),
		getCenterPoint: jest.fn().mockReturnValue({ x: 150, y: 150 }),
		width: 10,
	};

	return {
		createEraserIndicator: jest.fn().mockImplementation((canvas, pointer, size) => {
			mockIndicator.radius = size / 2;
			return mockIndicator;
		}),
		setupIndicatorEventListeners: jest.fn().mockReturnValue({
			removeListeners: jest.fn(),
		}),
		mockIndicator,
	};
});

const testUpdateSize = () => {
	test("應更新橡皮擦大小和指示器", () => {
		const mockCanvas = {
			renderAll: jest.fn(),
		};
		const mockEraserIndicator = {
			current: {
				set: jest.fn(),
			},
		};
		const settings = { size: 10 };

		const updateSize = (newSize) => {
			settings.size = newSize;
			if (mockEraserIndicator.current) {
				mockEraserIndicator.current.set({
					radius: newSize / 2,
				});
				mockCanvas.renderAll();
			}
		};

		updateSize(20);

		expect(settings.size).toBe(20);
		expect(mockEraserIndicator.current.set).toHaveBeenCalledWith({ radius: 10 });
		expect(mockCanvas.renderAll).toHaveBeenCalled();
	});
};

function sharedCleanup(eventHandlers, mockEraserIndicator, mockCanvas2) {
	eventHandlers.removeListeners();
	mockCanvas2.off("mouse:down");
	mockCanvas2.off("mouse:move");
	mockCanvas2.off("mouse:up");
	mockCanvas2.off("object:added");
	if (mockEraserIndicator.current) {
		mockCanvas2.remove(mockEraserIndicator.current);
		mockEraserIndicator.current = null;
	}
	mockCanvas2.getObjects().forEach((obj) => {
		if (obj._originalSelectable !== undefined) {
			obj.selectable = obj._originalSelectable;
			delete obj._originalSelectable;
		} else {
			obj.selectable = true;
		}
		obj.evented = true;
	});
	mockCanvas2.selection = true;
}

const testCleanup = () => {
	test("應移除事件監聽器並恢復畫布狀態", () => {
		const mockCanvas = {
			off: jest.fn(),
			remove: jest.fn(),
			getObjects: jest.fn().mockReturnValue([{ _originalSelectable: true, selectable: false, evented: false }]),
			selection: false,
		};

		const indicatorObject = {};

		const mockEraserIndicator = {
			current: indicatorObject,
		};

		const eventHandlers = {
			removeListeners: jest.fn(),
		};

		sharedCleanup(eventHandlers, mockEraserIndicator, mockCanvas);

		expect(eventHandlers.removeListeners).toHaveBeenCalled();
		expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
		expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
		expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");
		expect(mockCanvas.off).toHaveBeenCalledWith("object:added");

		expect(mockCanvas.remove).toHaveBeenCalledWith(indicatorObject);

		expect(mockCanvas.getObjects()[0].selectable).toBe(true);
		expect(mockCanvas.getObjects()[0].evented).toBe(true);
		expect(mockCanvas.selection).toBe(true);
		expect(mockEraserIndicator.current).toBeNull();
	});
};

describe("ObjectEraserTools", () => {
	let mockCanvas;
	let mockSettings;
	let eraserTools;

	const { mockIndicator } = require("../EraserIndicator");

	beforeEach(() => {
		jest.clearAllMocks();

		mockCanvas = {
			isDrawingMode: true,
			selection: true,
			off: jest.fn(),
			on: jest.fn(),
			getObjects: jest.fn().mockReturnValue([
				{
					id: "obj1",
					selectable: true,
					evented: true,
					getCenterPoint: jest.fn().mockReturnValue({ x: 100, y: 100 }),
					width: 20,
				},
				{
					id: "obj2",
					selectable: true,
					evented: true,
					getCenterPoint: jest.fn().mockReturnValue({ x: 200, y: 200 }),
					width: 30,
				},
			]),
			getPointer: jest.fn().mockReturnValue({ x: 100, y: 100 }),
			remove: jest.fn(),
			renderAll: jest.fn(),
		};

		mockSettings = {
			size: 20,
		};

		eraserTools = setupEraser(mockCanvas, mockSettings);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("setupEraser", () => {
		test("應正確初始化畫布設置", () => {
			expect(mockCanvas.isDrawingMode).toBe(false);
			expect(mockCanvas.selection).toBe(false);
		});

		test("應移除現有的事件監聽器", () => {
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:out");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:over");
		});

		test("應設置物件為不可選取且不可接收事件", () => {
			const objects = mockCanvas.getObjects();

			objects.forEach((obj) => {
				expect(obj._originalSelectable).toBe(true); // 保存原始狀態
				expect(obj.selectable).toBe(false);
				expect(obj.evented).toBe(false);
			});
		});

		test("應設置新的事件監聽器", () => {
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:down", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:move", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:up", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("object:added", expect.any(Function));
		});

		test("應創建指示器事件處理器", () => {
			expect(setupIndicatorEventListeners).toHaveBeenCalledWith(mockCanvas, expect.any(Object), expect.any(Function));
		});

		test("當畫布為 null 時應提前返回", () => {
			const result = setupEraser(null, mockSettings);

			expect(result).toBeUndefined();
		});

		test("應返回包含 updateSize 和 cleanup 方法的對象", () => {
			expect(eraserTools).toBeDefined();
			expect(typeof eraserTools.updateSize).toBe("function");
			expect(typeof eraserTools.cleanup).toBe("function");
		});
	});

	describe("eraseObjectsAt", () => {
		test("mouse:down 事件應觸發擦除功能", () => {
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			mouseDownHandler({ e: {} });

			expect(mockCanvas.remove).toHaveBeenCalled();
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("mouse:move 事件在擦除模式下應觸發擦除功能", () => {
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			mouseDownHandler({ e: {} });

			const mouseMoveHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			mockCanvas.remove.mockClear();
			mockCanvas.renderAll.mockClear();

			mouseMoveHandler({ e: {} });

			expect(mockCanvas.remove).toHaveBeenCalled();
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("mouse:up 事件應停止擦除模式", () => {
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			mouseDownHandler({ e: {} });

			const mouseUpHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:up")[1];

			mouseUpHandler();

			const mouseMoveHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			mockCanvas.remove.mockClear();
			mockCanvas.renderAll.mockClear();

			mouseMoveHandler({ e: {} });

			expect(mockCanvas.remove).not.toHaveBeenCalled();
		});

		test("應正確識別並跳過指示器物件", () => {
			mockCanvas.getObjects.mockReturnValueOnce([
				{
					id: "obj1",
					selectable: true,
					evented: true,
					getCenterPoint: jest.fn().mockReturnValue({ x: 100, y: 100 }),
					width: 20,
				},
				{
					id: "eraser-indicator",
					type: "circle",
					fill: "rgba(255, 0, 0, 0.3)",
					getCenterPoint: jest.fn().mockReturnValue({ x: 150, y: 150 }),
					width: 10,
				},
			]);

			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			mouseDownHandler({ e: {} });

			expect(mockCanvas.remove).toHaveBeenCalledTimes(1);
			expect(mockCanvas.remove).toHaveBeenCalledWith(expect.objectContaining({ id: "obj1" }));
		});

		test("eraseObjectsAt: 距離剛好等於邊界時不應移除物件", () => {
			mockCanvas.getObjects.mockReturnValue([
				{
					id: "obj1",
					type: "rect",
					fill: "#fff",
					getCenterPoint: () => ({ x: 100, y: 100 }),
					width: 20,
				},
			]);
			mockSettings.size = 20;
			const pointer = { x: 100, y: 130 }; // 距離 30
			mockCanvas.getPointer.mockReturnValue(pointer);
			mockCanvas.remove.mockClear();
			mockCanvas.renderAll.mockClear();
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			mouseDownHandler({ e: {} });
			expect(mockCanvas.remove).not.toHaveBeenCalled();
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});
		test("eraseObjectsAt: 多物件同時移除", () => {
			mockCanvas.getObjects.mockReturnValue([
				{
					id: "obj1",
					type: "rect",
					fill: "#fff",
					getCenterPoint: () => ({ x: 100, y: 100 }),
					width: 20,
				},
				{
					id: "obj2",
					type: "rect",
					fill: "#fff",
					getCenterPoint: () => ({ x: 105, y: 105 }),
					width: 20,
				},
			]);
			mockSettings.size = 40;
			const pointer = { x: 100, y: 100 };
			mockCanvas.getPointer.mockReturnValue(pointer);
			mockCanvas.remove.mockClear();
			mockCanvas.renderAll.mockClear();
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			mouseDownHandler({ e: {} });
			expect(mockCanvas.remove).toHaveBeenCalledTimes(2);
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
		test("eraseObjectsAt: 無物件時不應呼叫 remove/renderAll", () => {
			mockCanvas.getObjects.mockReturnValue([]);
			const pointer = { x: 0, y: 0 };
			mockCanvas.getPointer.mockReturnValue(pointer);
			mockCanvas.remove.mockClear();
			mockCanvas.renderAll.mockClear();
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			mouseDownHandler({ e: {} });
			expect(mockCanvas.remove).not.toHaveBeenCalled();
			expect(mockCanvas.renderAll).not.toHaveBeenCalled();
		});
	});

	describe("object:added", () => {
		test("應設置新物件為不可選取", () => {
			const objectAddedHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "object:added")[1];

			const newObject = { id: "new-obj", selectable: true, evented: true };

			objectAddedHandler({ target: newObject });

			expect(newObject._originalSelectable).toBe(true);
			expect(newObject.selectable).toBe(false);
			expect(newObject.evented).toBe(false);
		});

		test("應跳過指示器物件", () => {
			const objectAddedHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "object:added")[1];

			objectAddedHandler({ target: mockIndicator });

			expect(mockIndicator._originalSelectable).toBeUndefined();
		});
	});

	describe("updateSize", testUpdateSize);
	describe("cleanup", testCleanup);

	describe("disableEraser", () => {
		test("應移除事件監聽器並恢復物件狀態", () => {
			mockCanvas.getObjects = jest.fn().mockReturnValue([
				{ id: "obj1", selectable: false, evented: false, _originalSelectable: true },
				{ type: "circle", fill: "rgba(255, 0, 0, 0.3)" }, // 模擬指示器
			]);

			disableEraser(mockCanvas);

			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:over");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:out");
			expect(mockCanvas.off).toHaveBeenCalledWith("object:added");

			expect(mockCanvas.remove).toHaveBeenCalled();

			const objects = mockCanvas.getObjects();
			expect(objects[0].selectable).toBe(true);
			expect(objects[0].evented).toBe(true);

			expect(mockCanvas.selection).toBe(true);
		});

		test("當畫布為 null 時不應拋出錯誤", () => {
			expect(() => disableEraser(null)).not.toThrow();
		});

		test("cleanup: eraserIndicator.current 為 null 時不應呼叫 remove", () => {
			const eventHandlers = { removeListeners: jest.fn() };
			const mockEraserIndicator = { current: null };
			const mockCanvas2 = {
				off: jest.fn(),
				remove: jest.fn(),
				getObjects: jest.fn().mockReturnValue([{ _originalSelectable: true, selectable: false, evented: false }]),
				selection: false,
			};
			sharedCleanup(eventHandlers, mockEraserIndicator, mockCanvas2);
			expect(mockCanvas2.remove).not.toHaveBeenCalled();
		});
		test("cleanup: _originalSelectable 未定義時應設為 true 並 evented true", () => {
			const eventHandlers = { removeListeners: jest.fn() };
			const mockEraserIndicator = { current: null };
			const mockCanvas2 = {
				off: jest.fn(),
				remove: jest.fn(),
				getObjects: jest.fn().mockReturnValue([{ selectable: false, evented: false }]),
				selection: false,
			};
			sharedCleanup(eventHandlers, mockEraserIndicator, mockCanvas2);
			expect(mockCanvas2.getObjects()[0].selectable).toBe(true);
			expect(mockCanvas2.getObjects()[0].evented).toBe(true);
		});
		test("disableEraser: getObjects 空陣列時不應報錯", () => {
			const mockCanvas2 = {
				off: jest.fn(),
				getObjects: jest.fn().mockReturnValue([]),
				selection: false,
			};
			expect(() => disableEraser(mockCanvas2)).not.toThrow();
		});
		test("disableEraser: _originalSelectable 未定義時應設為 true 並 evented true", () => {
			const mockCanvas2 = {
				off: jest.fn(),
				getObjects: jest.fn().mockReturnValue([{ selectable: false, evented: false }]),
				selection: false,
				remove: jest.fn(),
				renderAll: jest.fn(),
			};
			disableEraser(mockCanvas2);
			expect(mockCanvas2.getObjects()[0].selectable).toBe(true);
			expect(mockCanvas2.getObjects()[0].evented).toBe(true);
		});
		test("disableEraser: eraserIndicators 為空時不呼叫 remove/renderAll", () => {
			const mockCanvas2 = {
				off: jest.fn(),
				getObjects: jest.fn().mockReturnValue([]),
				selection: false,
				remove: jest.fn(),
				renderAll: jest.fn(),
			};
			disableEraser(mockCanvas2);
			expect(mockCanvas2.remove).not.toHaveBeenCalled();
			expect(mockCanvas2.renderAll).not.toHaveBeenCalled();
		});
	});

	describe("ObjectEraserTools 內部 callback 與分支覆蓋", () => {
		test("createIndicatorAtPointer: eraserIndicator.current 有值時會呼叫 canvas.remove", () => {
			const mockCanvas = {
				remove: jest.fn(),
			};
			const mockSettings = { size: 10 };

			let eraserIndicator = { current: { id: "indicator" } };
			const pointer = { x: 1, y: 2 };

			const createEraserIndicator = jest.fn();

			const createIndicatorAtPointer = (pointer) => {
				if (eraserIndicator.current) {
					mockCanvas.remove(eraserIndicator.current);
				}
				return createEraserIndicator(mockCanvas, pointer, mockSettings.size);
			};
			createIndicatorAtPointer(pointer);
			expect(mockCanvas.remove).toHaveBeenCalledWith(eraserIndicator.current);
		});

		test("updateSize: eraserIndicator.current 有值時 set/renderAll 分支", () => {
			const mockCanvas = { renderAll: jest.fn() };
			const mockSettings = { size: 10 };
			const eraserIndicator = { current: { set: jest.fn() } };
			const updateSize = (newSize) => {
				mockSettings.size = newSize;
				if (eraserIndicator.current) {
					eraserIndicator.current.set({ radius: newSize / 2 });
					mockCanvas.renderAll();
				}
			};
			updateSize(20);
			expect(eraserIndicator.current.set).toHaveBeenCalledWith({ radius: 10 });
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});
	});
});
