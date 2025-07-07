import * as BrushUtils from "../BrushUtils";
jest.mock("fabric", () => ({
	FabricImage: { fromURL: jest.fn() },
}));

describe("BrushUtils", () => {
	let origCreateElement;
	beforeEach(() => {
		origCreateElement = global.document.createElement;
		jest.spyOn(BrushUtils, "trimCanvas").mockImplementation(() => ({ x: 0, y: 0 }));
	});
	afterEach(() => {
		global.document.createElement = origCreateElement;
		if (BrushUtils.trimCanvas.mockRestore) {
			BrushUtils.trimCanvas.mockRestore();
		}
	});

	describe("colorValues", () => {
		it("應正確處理透明", () => {
			expect(BrushUtils.colorValues("transparent")).toEqual([0, 0, 0, 0]);
		});
		it("應正確處理 hex", () => {
			expect(BrushUtils.colorValues("#ff0000")).toEqual([255, 0, 0, 1]);
		});
		it("應正確處理 #RGB", () => {
			expect(BrushUtils.colorValues("#f00")).toEqual([255, 0, 0, 1]);
		});
		it("應正確處理 #RGBA", () => {
			expect(BrushUtils.colorValues("#f00f")).toEqual([255, 0, 0, 1]);
		});
		it("應正確處理 rgb", () => {
			expect(BrushUtils.colorValues("rgb(1,2,3)")).toEqual([1, 2, 3, 1]);
		});
		it("應正確處理 rgba", () => {
			expect(BrushUtils.colorValues("rgba(1,2,3,0.5)")).toEqual([1, 2, 3, 0.5]);
		});
		it("應正確處理命名顏色", () => {
			const origCreate = document.createElement;
			const origAppend = document.body.appendChild;
			const origRemove = document.body.removeChild;
			const origGetComputedStyle = window.getComputedStyle;
			const fakeElem = { style: {}, parentNode: document.body, nodeType: 1 };
			document.createElement = jest.fn(() => fakeElem);
			document.body.appendChild = jest.fn();
			document.body.removeChild = jest.fn();
			window.getComputedStyle = jest.fn(() => ({ color: "rgb(255, 0, 0)" }));
			fakeElem.style.color = "";
			const result = BrushUtils.colorValues("red");
			expect(result).toEqual([255, 0, 0, 1]);
			document.createElement = origCreate;
			document.body.appendChild = origAppend;
			document.body.removeChild = origRemove;
			window.getComputedStyle = origGetComputedStyle;
		});
		it("命名顏色設置失敗時應回傳 undefined", () => {
			const origCreate = document.createElement;
			const origAppend = document.body.appendChild;
			const origRemove = document.body.removeChild;
			const origGetComputedStyle = window.getComputedStyle;
			const fakeElem = { style: {}, parentNode: document.body, nodeType: 1 };
			document.createElement = jest.fn(() => fakeElem);
			document.body.appendChild = jest.fn();
			document.body.removeChild = jest.fn();
			window.getComputedStyle = jest.fn(() => ({ color: "" }));
			const result = BrushUtils.colorValues("red");
			expect(result).toBeUndefined();
			document.createElement = origCreate;
			document.body.appendChild = origAppend;
			document.body.removeChild = origRemove;
			window.getComputedStyle = origGetComputedStyle;
		});
		it("命名顏色解析失敗時應回傳 undefined (style.color=flag)", () => {
			const origCreate = document.createElement;
			const origAppend = document.body.appendChild;
			const origRemove = document.body.removeChild;
			const origGetComputedStyle = window.getComputedStyle;
			const fakeElem = { style: {}, parentNode: document.body, nodeType: 1 };
			document.createElement = jest.fn(() => fakeElem);
			document.body.appendChild = jest.fn();
			document.body.removeChild = jest.fn();
			window.getComputedStyle = jest.fn(() => ({ color: "" }));
			const result = BrushUtils.colorValues("red");
			expect(result).toBeUndefined();
			document.createElement = origCreate;
			document.body.appendChild = origAppend;
			document.body.removeChild = origRemove;
			window.getComputedStyle = origGetComputedStyle;
		});
		it("命名顏色解析失敗時應回傳 undefined (style.color='')", () => {
			const origCreate = document.createElement;
			const origAppend = document.body.appendChild;
			const origRemove = document.body.removeChild;
			const origGetComputedStyle = window.getComputedStyle;
			const fakeElem = { style: {}, parentNode: document.body, nodeType: 1 };
			document.createElement = jest.fn(() => fakeElem);
			document.body.appendChild = jest.fn();
			document.body.removeChild = jest.fn();
			window.getComputedStyle = jest.fn(() => ({ color: "" }));
			const result = BrushUtils.colorValues("red");
			expect(result).toBeUndefined();
			document.createElement = origCreate;
			document.body.appendChild = origAppend;
			document.body.removeChild = origRemove;
			window.getComputedStyle = origGetComputedStyle;
		});
		it("應回傳 undefined 當顏色無效", () => {
			const origCreate = document.createElement;
			const origGetComputedStyle = window.getComputedStyle;
			const elem = origCreate.call(document, "div");
			elem.style.color = "notacolor";
			document.createElement = jest.fn(() => elem);
			window.getComputedStyle = jest.fn(() => ({ color: "" }));
			expect(BrushUtils.colorValues("notacolor")).toBeUndefined();
			document.createElement = origCreate;
			window.getComputedStyle = origGetComputedStyle;
		});
		it("應回傳 undefined 當 color 為 undefined", () => {
			expect(BrushUtils.colorValues(undefined)).toBeUndefined();
		});
	});

	describe("getRandom", () => {
		it("應回傳指定範圍內的亂數", () => {
			const val = BrushUtils.getRandom(10, 5);
			expect(val).toBeGreaterThanOrEqual(5);
			expect(val).toBeLessThan(10);
		});
	});

	describe("clamp", () => {
		it("應正確限制數值範圍", () => {
			expect(BrushUtils.clamp(5, 10, 1)).toBe(5);
			expect(BrushUtils.clamp(15, 10, 1)).toBe(10);
			expect(BrushUtils.clamp(-5, 10, 1)).toBe(1);
		});
	});

	describe("angleBetween", () => {
		it("應正確計算兩點間角度", () => {
			const p1 = { x: 0, y: 0 };
			const p2 = { x: 1, y: 0 };
			expect(BrushUtils.angleBetween(p1, p2)).toBeCloseTo(-Math.PI / 2);
		});
	});

	describe("normalize", () => {
		it("應正確標準化向量", () => {
			const point = { x: 3, y: 4, distanceFrom: ({ x, y }) => Math.hypot(3, 4) };
			const result = BrushUtils.normalize(point, 5);
			expect(result.x).toBeCloseTo(3);
			expect(result.y).toBeCloseTo(4);
		});
		it("thickness 為 null/undefined 時應預設為 1", () => {
			const point = { x: 3, y: 4, distanceFrom: () => 5 };
			const result = BrushUtils.normalize(point);
			expect(result.x).toBeCloseTo(0.6);
			expect(result.y).toBeCloseTo(0.8);
		});
		it("length 為 0 時不應改變 point", () => {
			const point = { x: 0, y: 0, distanceFrom: () => 0 };
			const result = BrushUtils.normalize(point, 5);
			expect(result.x).toBe(0);
			expect(result.y).toBe(0);
		});
	});

	describe("trimCanvas", () => {
		it("應正確裁切 canvas", () => {
			const ctx = {
				getImageData: jest.fn(() => ({
					data: [0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0],
				})),
				putImageData: jest.fn(),
			};
			const canvas = { width: 2, height: 2, getContext: () => ctx };
			const result = BrushUtils.trimCanvas(canvas);
			expect(result).toHaveProperty("x");
			expect(result).toHaveProperty("y");
		});
		it("全透明時應回傳 x:0, y:0", () => {
			const ctx = {
				getImageData: jest.fn(() => ({ data: [0, 0, 0, 0, 0, 0, 0, 0] })),
				putImageData: jest.fn(),
			};
			const canvas = { width: 1, height: 2, getContext: () => ctx };
			const result = BrushUtils.trimCanvas(canvas);
			expect(result).toEqual({ x: 0, y: 0 });
		});
	});

	function mockCanvasElement() {
		return {
			getContext: () => ({
				drawImage: jest.fn(),
				getImageData: jest.fn(() => ({ data: [255, 255, 255, 255] })),
				putImageData: jest.fn(),
			}),
			toDataURL: jest.fn(() => "data:image/png;base64,xxx"),
		};
	}

	it("應正確轉換 canvas 為 fabric image 並設置屬性", async () => {
		const mockImg = { set: jest.fn() };
		const mockFromURL = jest.fn(() => Promise.resolve(mockImg));
		require("fabric").FabricImage.fromURL = mockFromURL;
		const canvas = {
			getRetinaScaling: () => 2,
			upperCanvasEl: { width: 100, height: 100 },
		};
		global.document.createElement = jest.fn(mockCanvasElement);
		await BrushUtils.convertToImg(canvas);
		expect(mockFromURL).toHaveBeenCalled();
		expect(mockImg.set).toHaveBeenCalledWith({ left: 0, top: 0, scaleX: 0.5, scaleY: 0.5 });
	});
});
