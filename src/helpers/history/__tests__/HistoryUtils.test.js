import * as HistoryUtils from "../HistoryUtils";

describe("HistoryUtils", () => {
	describe("isEraserIndicator", () => {
		it("應正確判斷 eraser indicator", () => {
			expect(HistoryUtils.isEraserIndicator({ type: "circle", fill: "rgba(255, 0, 0, 0.3)" })).toBe(true);
			expect(HistoryUtils.isEraserIndicator({ type: "rect", fill: "rgba(255, 0, 0, 0.3)" })).toBe(false);
			expect(HistoryUtils.isEraserIndicator({ type: "circle", fill: "#fff" })).toBe(false);
			expect(HistoryUtils.isEraserIndicator(null)).toBe(false);
		});
	});

	describe("serializeCanvasState", () => {
		it("canvas 為 null 時應回傳 null", () => {
			expect(HistoryUtils.serializeCanvasState(null)).toBeNull();
		});
		it("應正確過濾 eraser indicator 並序列化", () => {
			const obj1 = { type: "rect", fill: "#fff" };
			const obj2 = { type: "circle", fill: "rgba(255, 0, 0, 0.3)" };
			const canvas = {
				getObjects: () => [obj1, obj2],
				_objects: [obj1, obj2],
				toJSON: jest.fn(() => ({ foo: "bar" })),
			};
			const json = HistoryUtils.serializeCanvasState(canvas);
			expect(canvas.toJSON).toHaveBeenCalledWith(["selectable", "erasable", "evented", "_originalSelectable"]);
			expect(json).toBe(JSON.stringify({ foo: "bar" }));
		});
	});

	describe("deserializeCanvasState", () => {
		it("canvas 或 jsonState 為 null 時應直接 return", async () => {
			await expect(HistoryUtils.deserializeCanvasState(null, "{}")).resolves.toBeUndefined();
			await expect(HistoryUtils.deserializeCanvasState({}, null)).resolves.toBeUndefined();
		});
		it("應正確反序列化並還原 viewport/zoom", async () => {
			const setViewportTransform = jest.fn();
			const setZoom = jest.fn();
			const clear = jest.fn();
			const loadFromJSON = jest.fn((state, cb) => cb());
			const requestRenderAll = jest.fn();
			const getObjects = jest.fn(() => [{ set: jest.fn(), setCoords: jest.fn() }]);
			const canvas = {
				viewportTransform: [1, 0, 0, 1, 0, 0],
				getZoom: () => 2,
				setViewportTransform,
				setZoom,
				clear,
				loadFromJSON,
				requestRenderAll,
				getObjects,
			};
			const json = JSON.stringify({ foo: "bar" });
			await HistoryUtils.deserializeCanvasState(canvas, json);
			expect(clear).toHaveBeenCalled();
			expect(loadFromJSON).toHaveBeenCalled();
			expect(setViewportTransform).toHaveBeenCalledWith([1, 0, 0, 1, 0, 0]);
			expect(setZoom).toHaveBeenCalledWith(2);
			expect(requestRenderAll).toHaveBeenCalled();
		});
		it("遇到 JSON 解析錯誤應拋出例外", async () => {
			const canvas = {
				clear: jest.fn(),
			};
			await expect(HistoryUtils.deserializeCanvasState(canvas, "{invalid json")).rejects.toThrow();
		});
	});
});
