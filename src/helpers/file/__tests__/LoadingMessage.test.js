import { showLoadingMessage, hideLoadingMessage } from "../LoadingMessage";

describe("LoadingMessage", () => {
	let originalBody;
	beforeEach(() => {
		// 保留原始 body
		originalBody = document.body.innerHTML;
	});
	afterEach(() => {
		// 還原 body
		document.body.innerHTML = originalBody;
	});

	test("showLoadingMessage: 應插入預設訊息並有正確樣式", () => {
		const el = showLoadingMessage();
		expect(el).toBeInstanceOf(HTMLElement);
		expect(el.textContent).toBe("正在加載文件...");
		expect(el.style.position).toBe("fixed");
		expect(el.style.zIndex).toBe("9999");
		expect(document.body.contains(el)).toBe(true);
	});

	test("showLoadingMessage: 可自訂訊息", () => {
		const el = showLoadingMessage("自訂訊息");
		expect(el.textContent).toBe("自訂訊息");
		expect(document.body.contains(el)).toBe(true);
	});

	test("hideLoadingMessage: 能正確移除訊息元素", () => {
		const el = showLoadingMessage("要移除的訊息");
		expect(document.body.contains(el)).toBe(true);
		hideLoadingMessage(el);
		expect(document.body.contains(el)).toBe(false);
	});

	test("hideLoadingMessage: 傳 null/undefined 不報錯", () => {
		expect(() => hideLoadingMessage(null)).not.toThrow();
		expect(() => hideLoadingMessage(undefined)).not.toThrow();
	});
});
