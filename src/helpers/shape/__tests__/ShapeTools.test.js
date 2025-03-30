import { setupShapeDrawing, disableShapeDrawing } from "../ShapeTools";
import { handleMouseDownRect, handleMouseMoveRect, isTooSmallRect } from "../RectangleShape";
import { handleMouseDownCircle, handleMouseMoveCircle, isTooSmallCircle } from "../CircleShape";
import { handleMouseDownTriangle, handleMouseMoveTriangle } from "../TriangleShape";
import { handleMouseDownEllipse, handleMouseMoveEllipse } from "../EllipseShape";
import { handleMouseDownLine, handleMouseMoveLine } from "../LineShape";

// 模擬各種形狀處理函數
jest.mock("../RectangleShape", () => ({
	handleMouseDownRect: jest.fn().mockReturnValue({ type: "rect", id: "rect1" }),
	handleMouseMoveRect: jest.fn(),
	isTooSmallRect: jest.fn(),
}));

jest.mock("../CircleShape", () => ({
	handleMouseDownCircle: jest.fn().mockReturnValue({ type: "circle", id: "circle1" }),
	handleMouseMoveCircle: jest.fn(),
	isTooSmallCircle: jest.fn(),
}));

jest.mock("../TriangleShape", () => ({
	handleMouseDownTriangle: jest.fn().mockReturnValue({ type: "triangle", id: "triangle1" }),
	handleMouseMoveTriangle: jest.fn(),
	isTooSmallTriangle: jest.fn(),
}));

jest.mock("../EllipseShape", () => ({
	handleMouseDownEllipse: jest.fn().mockReturnValue({ type: "ellipse", id: "ellipse1" }),
	handleMouseMoveEllipse: jest.fn(),
	isTooSmallEllipse: jest.fn(),
}));

jest.mock("../LineShape", () => ({
	handleMouseDownLine: jest.fn().mockReturnValue({ type: "line", id: "line1" }),
	handleMouseMoveLine: jest.fn(),
	isTooSmallLine: jest.fn(),
}));

describe("ShapeTools 測試", () => {
	let mockCanvas;
	let mockEvent;
	let shapeSettings;

	beforeEach(() => {
		// 重置所有 mock
		jest.clearAllMocks();

		// 創建模擬 canvas
		mockCanvas = {
			on: jest.fn(),
			off: jest.fn(),
			renderAll: jest.fn(),
			getPointer: jest.fn().mockReturnValue({ x: 100, y: 100 }),
			setActiveObject: jest.fn(),
			remove: jest.fn(),
			historyManager: {
				saveState: jest.fn(),
			},
			selection: true,
			_activeShape: null,
		};

		// 模擬事件物件
		mockEvent = {
			e: { type: "mousedown" },
			target: null,
		};

		// 基本形狀設置
		shapeSettings = {
			type: "RECT",
			fill: "#FF0000",
			stroke: "#000000",
			strokeWidth: 2,
			opacity: 0.8,
		};
	});

	describe("setupShapeDrawing", () => {
		test("應設置畫布選擇模式為 false", () => {
			setupShapeDrawing(mockCanvas, shapeSettings);
			expect(mockCanvas.selection).toBe(false);
		});

		test("應註冊必要的事件監聽器", () => {
			setupShapeDrawing(mockCanvas, shapeSettings);
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:down", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:move", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:up", expect.any(Function));
		});

		test("當 mouse:down 在已有物件上時不應開始繪製", () => {
			setupShapeDrawing(mockCanvas, shapeSettings);

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬點擊已有物件
			const eventWithTarget = { ...mockEvent, target: { type: "rect" } };
			mouseDownCallback(eventWithTarget);

			// 應該沒有調用任何形狀處理函數
			expect(handleMouseDownRect).not.toHaveBeenCalled();
		});

		test("當 mouse:down 在空白處時應開始繪製矩形", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "RECT" });

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬在空白處點擊
			mouseDownCallback(mockEvent);

			expect(mockCanvas.getPointer).toHaveBeenCalled();
			expect(handleMouseDownRect).toHaveBeenCalledWith(mockEvent, mockCanvas, { ...shapeSettings, type: "RECT" });
		});

		test("當 mouse:down 在空白處時應開始繪製圓形", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "CIRCLE" });

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬在空白處點擊
			mouseDownCallback(mockEvent);

			expect(handleMouseDownCircle).toHaveBeenCalledWith(mockEvent, mockCanvas, { ...shapeSettings, type: "CIRCLE" });
		});

		test("當 mouse:down 在空白處時應開始繪製三角形", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "TRIANGLE" });

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬在空白處點擊
			mouseDownCallback(mockEvent);

			expect(handleMouseDownTriangle).toHaveBeenCalledWith(mockEvent, mockCanvas, { ...shapeSettings, type: "TRIANGLE" });
		});

		test("當 mouse:down 在空白處時應開始繪製橢圓", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "ELLIPSE" });

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬在空白處點擊
			mouseDownCallback(mockEvent);

			expect(handleMouseDownEllipse).toHaveBeenCalledWith(mockEvent, mockCanvas, { ...shapeSettings, type: "ELLIPSE" });
		});

		test("當 mouse:down 在空白處時應開始繪製直線", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "LINE" });

			// 獲取註冊的 mouse:down 回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];

			// 模擬在空白處點擊
			mouseDownCallback(mockEvent);

			expect(handleMouseDownLine).toHaveBeenCalledWith(mockEvent, mockCanvas, { ...shapeSettings, type: "LINE" });
		});

		test("當 mouse:move 且正在繪製矩形時應更新形狀", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "RECT" });

			// 獲取註冊的回調函數
			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			const mouseMoveCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			// 先模擬開始繪製
			mouseDownCallback(mockEvent);

			// 然後模擬移動
			mouseMoveCallback(mockEvent);

			expect(handleMouseMoveRect).toHaveBeenCalled();
		});

		test("當 mouse:move 且正在繪製圓形時應更新形狀", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "CIRCLE" });

			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			const mouseMoveCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			mouseDownCallback(mockEvent);
			mouseMoveCallback(mockEvent);

			expect(handleMouseMoveCircle).toHaveBeenCalled();
		});

		test("當 mouse:move 且正在繪製三角形時應更新形狀", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "TRIANGLE" });

			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			const mouseMoveCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			mouseDownCallback(mockEvent);
			mouseMoveCallback(mockEvent);

			expect(handleMouseMoveTriangle).toHaveBeenCalled();
		});

		test("當 mouse:move 且正在繪製橢圓時應更新形狀", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "ELLIPSE" });

			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			const mouseMoveCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			mouseDownCallback(mockEvent);
			mouseMoveCallback(mockEvent);

			expect(handleMouseMoveEllipse).toHaveBeenCalled();
		});

		test("當 mouse:move 且正在繪製直線時應更新形狀", () => {
			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "LINE" });

			const mouseDownCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			const mouseMoveCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];

			mouseDownCallback(mockEvent);
			mouseMoveCallback(mockEvent);

			expect(handleMouseMoveLine).toHaveBeenCalled();
		});

		test("當 mouse:up 而未繪製時不應有任何反應", () => {
			setupShapeDrawing(mockCanvas, shapeSettings);

			// 獲取註冊的 mouse:up 回調函數
			const mouseUpCallback = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:up")[1];

			// 模擬抬起滑鼠，但未開始繪製
			mouseUpCallback();

			// 應該沒有調用任何渲染或移除方法
			expect(mockCanvas.remove).not.toHaveBeenCalled();
			expect(mockCanvas.setActiveObject).not.toHaveBeenCalled();
		});

		test("當 mouse:up 且形狀太小時應移除該形狀", () => {
			// 保存事件處理器的引用
			const eventHandlers = {};

			// 重新實現 mockCanvas.on 以捕獲所有事件處理器
			mockCanvas.on = jest.fn((eventName, handler) => {
				eventHandlers[eventName] = handler;
			});

			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "RECT" });

			// 設置形狀太小的回應
			isTooSmallRect.mockReturnValue(true);

			// 模擬形狀 - 加入 set 方法
			const shape = {
				type: "rect",
				id: "rect1",
				set: jest.fn().mockReturnThis(), // 添加 set 方法
			};
			handleMouseDownRect.mockReturnValue(shape);

			// 1. 模擬 mouse:down 事件（這會設置 isDrawing = true 和 currentShape）
			eventHandlers["mouse:down"](mockEvent);

			// 2. 模擬 mouse:up 事件
			eventHandlers["mouse:up"]();

			// 確認調用了正確的檢查和移除操作
			expect(isTooSmallRect).toHaveBeenCalledWith(shape);
			expect(mockCanvas.remove).toHaveBeenCalledWith(shape);
		});

		test("當 mouse:up 且形狀不太小時應設置該形狀並保存到歷史記錄", () => {
			// 使用假計時器
			jest.useFakeTimers();

			// 保存事件處理器的引用
			const eventHandlers = {};

			// 重新實現 mockCanvas.on 以捕獲所有事件處理器
			mockCanvas.on = jest.fn((eventName, handler) => {
				eventHandlers[eventName] = handler;
			});

			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "RECT" });

			// 設置形狀不太小的回應
			isTooSmallRect.mockReturnValue(false);

			// 模擬形狀 - 加入 set 方法
			const shape = {
				type: "rect",
				id: "rect1",
				set: jest.fn().mockReturnThis(), // 添加 set 方法，並返回自身以支持鏈式調用
			};
			handleMouseDownRect.mockReturnValue(shape);

			// 1. 模擬 mouse:down 事件
			eventHandlers["mouse:down"](mockEvent);

			// 2. 模擬 mouse:up 事件
			eventHandlers["mouse:up"]();

			// 驗證形狀被設置為可選且活動的
			expect(shape.set).toHaveBeenCalledWith(
				expect.objectContaining({
					selectable: true,
					hasControls: true,
					hasBorders: true,
				})
			);
			expect(mockCanvas.setActiveObject).toHaveBeenCalledWith(shape);

			// 運行所有計時器
			jest.runAllTimers();

			// 驗證歷史記錄保存被調用
			expect(mockCanvas.historyManager.saveState).toHaveBeenCalled();

			// 恢復真實計時器
			jest.useRealTimers();
		});

		test("當 canvas 沒有 historyManager 時不應拋出錯誤", () => {
			// 保存事件處理器的引用
			const eventHandlers = {};

			// 重新實現 mockCanvas.on 以捕獲所有事件處理器
			mockCanvas.on = jest.fn((eventName, handler) => {
				eventHandlers[eventName] = handler;
			});

			// 移除 historyManager
			delete mockCanvas.historyManager;

			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "RECT" });

			// 設置形狀不太小的回應
			isTooSmallRect.mockReturnValue(false);

			// 模擬形狀 - 加入 set 方法
			const shape = {
				type: "rect",
				id: "rect1",
				set: jest.fn().mockReturnThis(), // 添加 set 方法
			};
			handleMouseDownRect.mockReturnValue(shape);

			// 1. 模擬 mouse:down 事件
			eventHandlers["mouse:down"](mockEvent);

			// 2. 模擬 mouse:up 事件 - 不應拋出錯誤
			expect(() => eventHandlers["mouse:up"]()).not.toThrow();

			// 驗證形狀被設置為可選且活動的
			expect(shape.set).toHaveBeenCalled();
			expect(mockCanvas.setActiveObject).toHaveBeenCalledWith(shape);
		});

		test("當繪製圓形且太小時應移除該形狀", () => {
			const eventHandlers = {};
			mockCanvas.on = jest.fn((eventName, handler) => {
				eventHandlers[eventName] = handler;
			});

			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "CIRCLE" });

			isTooSmallCircle.mockReturnValue(true);

			const shape = {
				type: "circle",
				id: "circle1",
				set: jest.fn().mockReturnThis(),
			};
			handleMouseDownCircle.mockReturnValue(shape);

			eventHandlers["mouse:down"](mockEvent);
			eventHandlers["mouse:up"]();

			expect(isTooSmallCircle).toHaveBeenCalledWith(shape);
			expect(mockCanvas.remove).toHaveBeenCalledWith(shape);
		});

		test("當提供無效形狀類型時不應拋出錯誤", () => {
			const eventHandlers = {};
			mockCanvas.on = jest.fn((eventName, handler) => {
				eventHandlers[eventName] = handler;
			});

			setupShapeDrawing(mockCanvas, { ...shapeSettings, type: "INVALID_TYPE" });

			// 確保調用事件處理器不會拋出錯誤
			expect(() => eventHandlers["mouse:down"](mockEvent)).not.toThrow();
			expect(() => eventHandlers["mouse:move"](mockEvent)).not.toThrow();
			expect(() => eventHandlers["mouse:up"]()).not.toThrow();
		});
	});

	describe("disableShapeDrawing", () => {
		test("應重設畫布選擇模式為 true", () => {
			disableShapeDrawing(mockCanvas);
			expect(mockCanvas.selection).toBe(true);
		});

		test("應移除所有相關事件監聽器", () => {
			disableShapeDrawing(mockCanvas);
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:dblclick");
		});

		test("當 canvas 為 null 時不應拋出錯誤", () => {
			expect(() => disableShapeDrawing()).not.toThrow();
		});
	});
});
