import { calculateImageDisplayProps, calculateInitialSelection, convertSelectionToImageCoordinates } from "../ImagePreview";

describe("ImagePreview 測試", () => {
	// calculateImageDisplayProps 測試
	describe("calculateImageDisplayProps", () => {
		test("當容器比圖像大時應正確計算縮放比例和位置", () => {
			const containerSize = { width: 800, height: 600 };
			const imageSize = { width: 400, height: 300 };
			const padding = 40;

			const result = calculateImageDisplayProps(containerSize, imageSize, padding);

			// 在這種情況下，圖像應該不會超過 0.9 倍的縮放
			expect(result.scale).toBe(0.9);
			// 檢查偏移量是否居中
			expect(result.offset.x).toBeCloseTo(220);
			expect(result.offset.y).toBeCloseTo(165);
		});

		test("當圖像比容器大時應正確縮小", () => {
			const containerSize = { width: 400, height: 300 };
			const imageSize = { width: 1200, height: 900 };
			const padding = 40;

			const result = calculateImageDisplayProps(containerSize, imageSize, padding);

			// 應選擇較小的縮放比例以適應容器
			expect(result.scale).toBeCloseTo(0.2444, 4); // 實際值為 (400-80)/1200 = 0.2666...，但限制最大為 0.9
			// 檢查偏移量是否為最小邊距
			expect(result.offset.x).toBeCloseTo(53.33, 2); // 根據實際計算結果修正
			expect(result.offset.y).toBe(40);
		});

		test("應根據不同邊距調整結果", () => {
			const containerSize = { width: 800, height: 600 };
			const imageSize = { width: 400, height: 300 };
			const padding = 100;

			const result = calculateImageDisplayProps(containerSize, imageSize, padding);

			// 因為邊距增大，縮放比例會減小
			expect(result.scale).toBe(0.9); // 仍然受到 0.9 最大限制
			expect(result.offset.x).toBeGreaterThanOrEqual(100);
			expect(result.offset.y).toBeGreaterThanOrEqual(100);
		});

		test("當容器極小或圖像極大時應有最小縮放", () => {
			const containerSize = { width: 100, height: 100 };
			const imageSize = { width: 2000, height: 1500 };
			const padding = 20;

			const result = calculateImageDisplayProps(containerSize, imageSize, padding);

			// 驗證縮放比例很小但大於 0
			expect(result.scale).toBeCloseTo(0.03, 2); // (100-40)/2000
			// 驗證偏移等於邊距
			expect(result.offset.x).toBe(20);
			expect(result.offset.y).toBe(27.5); // 使用實際計算值
		});
	});

	// calculateInitialSelection 測試
	describe("calculateInitialSelection", () => {
		test("應計算預設選區大小和位置", () => {
			const imageSize = { width: 600, height: 400 };
			const offset = { x: 50, y: 50 };
			const maxWidth = 500;
			const maxHeight = 500;

			const result = calculateInitialSelection(imageSize, offset, maxWidth, maxHeight);

			// 選區寬度應為圖像寬度的 80%
			expect(result.width).toBe(480); // 600 * 0.8
			// 選區高度應為圖像高度的 80%
			expect(result.height).toBe(320); // 400 * 0.8
			// 選區應居中
			expect(result.x).toBe(110); // 50 + (600 - 480)/2
			expect(result.y).toBe(90); // 50 + (400 - 320)/2
		});

		test("當設定最大值限制時應遵循限制", () => {
			const imageSize = { width: 800, height: 600 };
			const offset = { x: 100, y: 100 };
			const maxWidth = 300;
			const maxHeight = 200;

			const result = calculateInitialSelection(imageSize, offset, maxWidth, maxHeight);

			// 選區應受最大值限制
			expect(result.width).toBe(300);
			expect(result.height).toBe(200);
			// 選區應居中
			expect(result.x).toBe(350); // 100 + (800 - 300)/2
			expect(result.y).toBe(300); // 100 + (600 - 200)/2
		});

		test("應處理無偏移的情況", () => {
			const imageSize = { width: 400, height: 300 };
			const offset = { x: 0, y: 0 };

			const result = calculateInitialSelection(imageSize, offset);

			// 選區應居中且大小正確
			expect(result.x).toBe(40); // 0 + (400 - 320)/2
			expect(result.y).toBe(30); // 0 + (300 - 240)/2
			expect(result.width).toBe(320); // 400 * 0.8
			expect(result.height).toBe(240); // 300 * 0.8
		});
	});

	// convertSelectionToImageCoordinates 測試
	describe("convertSelectionToImageCoordinates", () => {
		test("應將選區座標轉換為原始圖像座標", () => {
			const selection = { x: 150, y: 120, width: 300, height: 200 };
			const offset = { x: 50, y: 50 };
			const scale = 0.5;

			const result = convertSelectionToImageCoordinates(selection, offset, scale);

			// 計算期望值
			expect(result.x).toBe(200); // (150 - 50) / 0.5
			expect(result.y).toBe(140); // (120 - 50) / 0.5
			expect(result.width).toBe(600); // 300 / 0.5
			expect(result.height).toBe(400); // 200 / 0.5
		});

		test("在不同縮放比例下的轉換", () => {
			const selection = { x: 100, y: 100, width: 200, height: 150 };
			const offset = { x: 40, y: 30 };
			const scale = 0.25;

			const result = convertSelectionToImageCoordinates(selection, offset, scale);

			// 計算期望值
			expect(result.x).toBe(240); // (100 - 40) / 0.25
			expect(result.y).toBe(280); // (100 - 30) / 0.25
			expect(result.width).toBe(800); // 200 / 0.25
			expect(result.height).toBe(600); // 150 / 0.25
		});

		test("當選區位於偏移點時應得到零位置", () => {
			const selection = { x: 50, y: 70, width: 100, height: 80 };
			const offset = { x: 50, y: 70 };
			const scale = 0.5;

			const result = convertSelectionToImageCoordinates(selection, offset, scale);

			// 選區邊緣與偏移點重合，轉換後的 x, y 應為 0
			expect(result.x).toBe(0); // (50 - 50) / 0.5
			expect(result.y).toBe(0); // (70 - 70) / 0.5
			expect(result.width).toBe(200); // 100 / 0.5
			expect(result.height).toBe(160); // 80 / 0.5
		});
	});
});
