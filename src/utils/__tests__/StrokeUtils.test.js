import Stroke from "../StrokeUtils";

describe("StrokeUtils", () => {
	let ctx;
	let pointer;
	beforeEach(() => {
		ctx = {
			lineCap: "",
			save: jest.fn(),
			restore: jest.fn(),
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			stroke: jest.fn(),
		};
		pointer = { x: 10, y: 20 };
	});

	it("應能正確建構 Stroke 實例", () => {
		const s = new Stroke(ctx, pointer, 5, "#000", 2, 1);
		expect(s.ctx).toBe(ctx);
		expect(s.color).toBe("#000");
		expect(s.lineWidth).toBe(2);
		expect(s.inkAmount).toBe(1);
		expect(s._point).toBeDefined();
	});

	it("update 應更新 _lastPoint 與 _currentLineWidth", () => {
		const s = new Stroke(ctx, pointer, 5, "#000", 2, 1);
		s._point = { x: 1, y: 2, addEquals: jest.fn(), distanceFrom: () => 1 };
		s.update(pointer, { x: 1, y: 1 }, 2);
		expect(s._lastPoint).toBeDefined();
		expect(s._point.addEquals).toHaveBeenCalled();
	});

	it("draw 應呼叫 line", () => {
		const s = new Stroke(ctx, pointer, 5, "#000", 2, 1);
		s._lastPoint = { x: 1, y: 2 };
		s._point = { x: 3, y: 4 };
		s.line = jest.fn();
		s.draw();
		expect(s.line).toHaveBeenCalled();
	});

	it("line 應正確繪製線段", () => {
		const s = new Stroke(ctx, pointer, 5, "#000", 2, 1);
		const p1 = { x: 1, y: 2 };
		const p2 = { x: 3, y: 4 };
		s.line(ctx, p1, p2, "#123", 5);
		expect(ctx.strokeStyle).toBe("#123");
		expect(ctx.lineWidth).toBe(5);
		expect(ctx.beginPath).toHaveBeenCalled();
		expect(ctx.moveTo).toHaveBeenCalledWith(1, 2);
		expect(ctx.lineTo).toHaveBeenCalledWith(3, 4);
		expect(ctx.stroke).toHaveBeenCalled();
	});
});
