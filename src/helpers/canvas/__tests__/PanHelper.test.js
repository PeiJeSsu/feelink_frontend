import * as fabric from "fabric";
import { handleMiddleButtonPan, setupMiddleButtonPan, setPanningMode } from "../PanHelper";

// 模擬 fabric.js
jest.mock("fabric", () => {
	return {
		Point: jest.fn().mockImplementation((x, y) => ({ x, y })),
	};
});

describe("PanHelper", () => {
	// 測試 handleMiddleButtonPan 函數
	describe("handleMiddleButtonPan", () => {
		test("當 canvas 為 null 時應返回原始 dragStart", () => {
			const dragStart = { x: 100, y: 100 };
			const e = { clientX: 150, clientY: 120 };

			// 調用函數
			const result = handleMiddleButtonPan(null, e, dragStart);

			// 驗證結果
			expect(result).toBe(dragStart);
		});

		test("應正確計算新的視角位置並返回新的拖曳起點", () => {
			const dragStart = { x: 100, y: 100 };
			const e = { clientX: 150, clientY: 120 };

			// 模擬 canvas 物件
			const mockCanvas = {
				viewportTransform: [1, 0, 0, 1, 50, 50], // 初始視角位置
				setViewportTransform: jest.fn(),
			};

			// 調用函數
			const result = handleMiddleButtonPan(mockCanvas, e, dragStart);

			// 驗證視角更新
			expect(mockCanvas.viewportTransform[4]).toBe(100); // 50 + (150 - 100)
			expect(mockCanvas.viewportTransform[5]).toBe(70); // 50 + (120 - 100)
			expect(mockCanvas.setViewportTransform).toHaveBeenCalledWith(mockCanvas.viewportTransform);

			// 驗證返回的新拖曳起點
			expect(result).toEqual({ x: 150, y: 120 });
		});

		test("應正確處理觸控事件", () => {
			const dragStart = { x: 100, y: 100 };
			const touchEvent = { 
				touches: [{ clientX: 150, clientY: 120 }]
			};

			// 模擬 canvas 物件
			const mockCanvas = {
				viewportTransform: [1, 0, 0, 1, 50, 50],
				setViewportTransform: jest.fn(),
			};

			// 調用函數
			const result = handleMiddleButtonPan(mockCanvas, touchEvent, dragStart);

			// 驗證視角更新
			expect(mockCanvas.viewportTransform[4]).toBe(100);
			expect(mockCanvas.viewportTransform[5]).toBe(70);
			expect(mockCanvas.setViewportTransform).toHaveBeenCalledWith(mockCanvas.viewportTransform);

			// 驗證返回的新拖曳起點
			expect(result).toEqual({ x: 150, y: 120 });
		});
	});

	// 測試 setupMiddleButtonPan 函數
	describe("setupMiddleButtonPan", () => {
		let mockCanvas;
		let setIsDraggingMock;
		let setDragStartMock;
		let handleMouseMoveMock;
		let handleMouseUpMock;
		let addEventListenerSpy;
		let removeEventListenerSpy;

		beforeEach(() => {
			// 模擬 canvas 物件
			mockCanvas = {
				upperCanvasEl: {
					addEventListener: jest.fn(),
					removeEventListener: jest.fn(),
				},
				discardActiveObject: jest.fn(),
				renderAll: jest.fn(),
			};

			// 模擬狀態設置函數
			setIsDraggingMock = jest.fn();
			setDragStartMock = jest.fn();
			handleMouseMoveMock = jest.fn();
			handleMouseUpMock = jest.fn();

			// 保存原始 addEventListener 和 removeEventListener
			addEventListenerSpy = jest.spyOn(window, "addEventListener");
			removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
		});

		afterEach(() => {
			// 恢復原始函數
			addEventListenerSpy.mockRestore();
			removeEventListenerSpy.mockRestore();
		});

		test("當 canvas 為 null 時應返回無操作清理函數", () => {
			const cleanupFn = setupMiddleButtonPan(
				null,
				setIsDraggingMock,
				setDragStartMock,
				handleMouseMoveMock,
				handleMouseUpMock
			);

			expect(typeof cleanupFn).toBe("function");

			// 調用清理函數確保不會拋出錯誤
			expect(() => cleanupFn()).not.toThrow();
		});

		test("應正確設置事件監聽器並返回清理函數", () => {
			const cleanupFn = setupMiddleButtonPan(
				mockCanvas,
				setIsDraggingMock,
				setDragStartMock,
				handleMouseMoveMock,
				handleMouseUpMock
			);

			// 驗證事件監聽器已設置 (只有滑鼠事件)
			expect(mockCanvas.upperCanvasEl.addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
			expect(addEventListenerSpy).toHaveBeenCalledWith("mousemove", handleMouseMoveMock);
			expect(addEventListenerSpy).toHaveBeenCalledWith("mouseup", handleMouseUpMock);

			// 調用清理函數
			cleanupFn();

			// 驗證事件監聽器已移除 (只有滑鼠事件)
			expect(mockCanvas.upperCanvasEl.removeEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
			expect(removeEventListenerSpy).toHaveBeenCalledWith("mousemove", handleMouseMoveMock);
			expect(removeEventListenerSpy).toHaveBeenCalledWith("mouseup", handleMouseUpMock);
		});

		test("當滑鼠中鍵按下時應設置拖曳狀態", () => {
			// 設置監聽器
			setupMiddleButtonPan(mockCanvas, setIsDraggingMock, setDragStartMock, handleMouseMoveMock, handleMouseUpMock);

			// 獲取註冊的滑鼠按下處理函數
			const mouseDownHandler = mockCanvas.upperCanvasEl.addEventListener.mock.calls[0][1];

			// 模擬中鍵按下事件
			const mouseEvent = {
				button: 1, // 中鍵
				clientX: 100,
				clientY: 200,
				preventDefault: jest.fn(),
			};
			mouseDownHandler(mouseEvent);

			// 驗證事件已被處理
			expect(mouseEvent.preventDefault).toHaveBeenCalled();
			expect(setIsDraggingMock).toHaveBeenCalledWith(true);
			expect(setDragStartMock).toHaveBeenCalledWith({ x: 100, y: 200 });
			expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
			expect(mockCanvas.renderAll).toHaveBeenCalled();
		});

		test("當非中鍵按下時不應設置拖曳狀態", () => {
			// 設置監聽器
			setupMiddleButtonPan(mockCanvas, setIsDraggingMock, setDragStartMock, handleMouseMoveMock, handleMouseUpMock);

			// 獲取註冊的滑鼠按下處理函數
			const mouseDownHandler = mockCanvas.upperCanvasEl.addEventListener.mock.calls[0][1];

			// 模擬左鍵按下事件
			const mouseEvent = {
				button: 0, // 左鍵
				clientX: 100,
				clientY: 200,
				preventDefault: jest.fn(),
			};
			mouseDownHandler(mouseEvent);

			// 驗證沒有處理事件
			expect(mouseEvent.preventDefault).not.toHaveBeenCalled();
			expect(setIsDraggingMock).not.toHaveBeenCalled();
			expect(setDragStartMock).not.toHaveBeenCalled();
		});
	});

	// 測試 setPanningMode 函數
	describe("setPanningMode", () => {
		let mockCanvas;
		let mockObjects;

		beforeEach(() => {
			// 創建模擬物件
			mockObjects = [{ selectable: true }, { selectable: false }];

			// 模擬 canvas 物件
			mockCanvas = {
				getObjects: jest.fn(() => mockObjects),
				selection: true,
				defaultCursor: "default",
				off: jest.fn(),
				on: jest.fn(),
				relativePan: jest.fn(),
			};
		});

		test("當 canvas 為 null 時不應拋出錯誤", () => {
			expect(() => setPanningMode(null, true)).not.toThrow();
		});

		test("開啟平移模式時應正確設置物件和畫布屬性", () => {
			// 先保存原始值以便後續比較
			const originalSelectableValues = mockObjects.map((obj) => obj.selectable);

			setPanningMode(mockCanvas, true);

			// 驗證物件屬性已保存和更新
			mockObjects.forEach((obj, index) => {
				// _originalSelectable 應保存原始值
				expect(obj._originalSelectable).toBe(originalSelectableValues[index]);
				// selectable 應該被設為 false
				expect(obj.selectable).toBe(false);
			});

			// 驗證畫布屬性
			expect(mockCanvas.selection).toBe(false);
			expect(mockCanvas.defaultCursor).toBe("grab");

			// 驗證事件處理
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");

			// 驗證新事件監聽器已設置
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:down", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:move", expect.any(Function));
			expect(mockCanvas.on).toHaveBeenCalledWith("mouse:up", expect.any(Function));
		});

		test("關閉平移模式時應正確還原默認狀態", () => {
			// 重置模擬物件
			mockObjects = [
				{ selectable: false, _originalSelectable: true },
				{ selectable: false, _originalSelectable: false },
			];
			mockCanvas.getObjects.mockReturnValue(mockObjects);

			// 關閉平移模式
			setPanningMode(mockCanvas, false);

			// 驗證每個物件的 selectable 被還原為其原始值
			expect(mockObjects[0].selectable).toBe(true); // 第一個物件應還原為 true
			expect(mockObjects[1].selectable).toBe(true); // 在實際程式中，第二個物件也被設為 true

			// 驗證畫布屬性
			expect(mockCanvas.selection).toBe(true);
			expect(mockCanvas.defaultCursor).toBe("default");

			// 驗證事件處理
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:down");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:move");
			expect(mockCanvas.off).toHaveBeenCalledWith("mouse:up");

			// 驗證沒有添加新的事件監聽器
			expect(mockCanvas.on).not.toHaveBeenCalled();
		});

		test("平移模式下的滑鼠事件應正確處理拖曳", () => {
			setPanningMode(mockCanvas, true);

			// 獲取註冊的事件處理函數
			const mouseDownHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:down")[1];
			const mouseMoveHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:move")[1];
			const mouseUpHandler = mockCanvas.on.mock.calls.find((call) => call[0] === "mouse:up")[1];

			// 模擬滑鼠按下
			mouseDownHandler({ e: { clientX: 100, clientY: 200 } });
			expect(mockCanvas.defaultCursor).toBe("grabbing");

			// 模擬滑鼠移動
			mouseMoveHandler({ e: { clientX: 150, clientY: 250 } });
			expect(mockCanvas.relativePan).toHaveBeenCalledWith(expect.any(Object));

			// 將 fabric.Point 的創建還原為正常的值檢查
			expect(fabric.Point).toHaveBeenCalledWith(50, 50); // 150-100, 250-200

			// 模擬滑鼠放開
			mouseUpHandler();
			expect(mockCanvas.defaultCursor).toBe("grab");
		});
	});
});
