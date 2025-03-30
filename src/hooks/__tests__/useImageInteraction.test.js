import { renderHook, act } from "@testing-library/react";
import { useImageInteraction } from "../useImageInteraction";

describe("useImageInteraction Hook", () => {
	test("應該返回正確的初始狀態", () => {
		const { result } = renderHook(() => useImageInteraction({ x: 10, y: 20 }, 1.5));

		expect(result.current.offset).toEqual({ x: 10, y: 20 });
		expect(result.current.scale).toBe(1.5);
		expect(result.current.isDragging).toBe(false);
	});

	// 測試滑鼠中鍵按下事件
	test("當滑鼠中鍵按下時應設置拖動狀態", () => {
		const { result } = renderHook(() => useImageInteraction());

		act(() => {
			// 模擬滑鼠中鍵按下事件
			const mouseEvent = new MouseEvent("mousedown", { button: 1, clientX: 100, clientY: 100 });
			result.current.handleMouseDown(mouseEvent);
		});

		expect(result.current.isDragging).toBe(true);
	});

	// 測試非中鍵按下時不應設置拖動狀態
	test("當非中鍵按下時不應設置拖動狀態", () => {
		const { result } = renderHook(() => useImageInteraction());

		act(() => {
			// 模擬滑鼠左鍵按下事件
			const mouseEvent = new MouseEvent("mousedown", { button: 0, clientX: 100, clientY: 100 });
			result.current.handleMouseDown(mouseEvent);
		});

		expect(result.current.isDragging).toBe(false);
	});

	// 測試滑鼠移動時的偏移計算
	test("當拖動時應更新偏移量", () => {
		const { result } = renderHook(() => useImageInteraction({ x: 0, y: 0 }));

		// 設置拖動狀態並模擬拖動起點
		act(() => {
			// 模擬滑鼠中鍵按下事件
			const mouseDownEvent = new MouseEvent("mousedown", { button: 1, clientX: 100, clientY: 100 });
			result.current.handleMouseDown(mouseDownEvent);
		});

		// 模擬滑鼠移動事件
		const moveEvent = new MouseEvent("mousemove", { clientX: 150, clientY: 120 });

		// 由於 mousemove 事件監聽器是在 useEffect 中添加的，我們需要模擬這個監聽器的調用
		act(() => {
			document.dispatchEvent(moveEvent);
		});

		// 檢查偏移量是否更新
		expect(result.current.offset).toEqual({ x: 50, y: 20 });
	});

	// 測試滑鼠滾輪縮放
	test("應正確處理滑鼠滾輪縮放", () => {
		const { result } = renderHook(() => useImageInteraction({ x: 0, y: 0 }, 1));

		// 創建模擬的容器引用
		const mockContainerRef = {
			current: {
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					width: 800,
					height: 600,
				}),
			},
		};

		// 模擬滑鼠滾輪向上滾動事件
		act(() => {
			const wheelEvent = {
				deltaY: -100,
				clientX: 400,
				clientY: 300,
				preventDefault: jest.fn(),
			};
			result.current.handleWheel(wheelEvent, mockContainerRef);
		});

		// 滾輪向上滾動應該放大
		expect(result.current.scale).toBeGreaterThan(1);

		// 模擬滑鼠滾輪向下滾動事件
		act(() => {
			// 重置為初始縮放
			result.current.setScale(1);
			const wheelEvent = {
				deltaY: 100,
				clientX: 400,
				clientY: 300,
				preventDefault: jest.fn(),
			};
			result.current.handleWheel(wheelEvent, mockContainerRef);
		});

		// 滾輪向下滾動應該縮小
		expect(result.current.scale).toBeLessThan(1);
	});

	// 測試縮放限制
	test("縮放應該有最小和最大限制", () => {
		const { result } = renderHook(() => useImageInteraction({ x: 0, y: 0 }, 1));

		// 創建模擬的容器引用
		const mockContainerRef = {
			current: {
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					width: 800,
					height: 600,
				}),
			},
		};

		// 測試最大限制 (通常是 5)
		act(() => {
			result.current.setScale(5); // 設置一個接近最大值的縮放

			const wheelEvent = {
				deltaY: -100,
				clientX: 400,
				clientY: 300,
				preventDefault: jest.fn(),
			};

			for (let i = 0; i < 10; i++) {
				result.current.handleWheel(wheelEvent, mockContainerRef); // 模擬大量放大操作
			}
		});

		// 應該不會超過最大限制
		expect(result.current.scale).toBeLessThanOrEqual(5);

		// 測試最小限制 (通常是 0.1)
		act(() => {
			result.current.setScale(0.1); // 設置一個接近最小值的縮放

			const wheelEvent = {
				deltaY: 100,
				clientX: 400,
				clientY: 300,
				preventDefault: jest.fn(),
			};

			for (let i = 0; i < 10; i++) {
				result.current.handleWheel(wheelEvent, mockContainerRef); // 模擬大量縮小操作
			}
		});

		// 應該不會低於最小限制
		expect(result.current.scale).toBeGreaterThanOrEqual(0.1);
	});

	// 測試滑鼠放開時結束拖動
	test("當滑鼠放開時應停止拖動", () => {
		const { result } = renderHook(() => useImageInteraction());

		// 設置拖動狀態
		act(() => {
			const mouseDownEvent = new MouseEvent("mousedown", { button: 1, clientX: 100, clientY: 100 });
			result.current.handleMouseDown(mouseDownEvent);
		});

		expect(result.current.isDragging).toBe(true);

		// 模擬滑鼠放開事件
		act(() => {
			document.dispatchEvent(new MouseEvent("mouseup"));
		});

		// 拖動狀態應該被重置
		expect(result.current.isDragging).toBe(false);
	});
});
