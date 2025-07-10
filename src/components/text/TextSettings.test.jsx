import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextSettings from "./TextSettings";

const mockOnTextSettingsChange = jest.fn();
const mockCanvas = {
	getObjects: () => [
		{ type: "textbox", text: "Hello" },
		{ type: "textbox", text: "世界" },
	],
};

describe("TextSettings", () => {
	beforeEach(() => {
		mockOnTextSettingsChange.mockClear();
	});

	it("切換字型時，若舊 fontWeight 不存在於新字型，會自動重設為新字型預設值", async () => {
		const textSettings = {
			fontFamily: '"Noto Sans TC", sans-serif',
			fontSize: 24,
			fill: "#000000",
			fontWeight: "900", // Noto Sans TC 有 900，但 Arial 沒有
		};
		const { getByLabelText, findByText } = render(
			<TextSettings textSettings={textSettings} onTextSettingsChange={mockOnTextSettingsChange} canvas={mockCanvas} />
		);
		// 點擊 select 打開選單
		userEvent.click(getByLabelText("字型"));
		// 點擊 Arial
		const arialOption = await findByText("Arial");
		userEvent.click(arialOption);
		await waitFor(() => {
			expect(mockOnTextSettingsChange).toHaveBeenCalledWith(
				expect.objectContaining({
					fontFamily: "Arial, sans-serif",
					fontWeight: "400",
				})
			);
		});
	});

	it("切換字型時，若舊 fontWeight 存在於新字型，會保留原值", async () => {
		const textSettings = {
			fontFamily: '"Noto Sans TC", sans-serif',
			fontSize: 24,
			fill: "#000000",
			fontWeight: "400", // 400 兩個字型都有
		};
		const { getByLabelText, findByText } = render(
			<TextSettings textSettings={textSettings} onTextSettingsChange={mockOnTextSettingsChange} canvas={mockCanvas} />
		);
		// 點擊 select 打開選單
		userEvent.click(getByLabelText("字型"));
		// 點擊 "思源宋體"
		const notoSerifOption = await findByText("思源宋體");
		userEvent.click(notoSerifOption);
		await waitFor(() => {
			expect(mockOnTextSettingsChange).toHaveBeenCalledWith(
				expect.objectContaining({
					fontFamily: '"Noto Serif TC", serif',
					fontWeight: "400",
				})
			);
		});
	});

	it("調整字型粗細滑桿時會正確呼叫 onTextSettingsChange 並帶入正確 fontWeight", async () => {
		const textSettings = {
			fontFamily: '"Noto Sans TC", sans-serif',
			fontSize: 24,
			fill: "#000000",
			fontWeight: "400",
		};
		const { getAllByRole } = render(
			<TextSettings textSettings={textSettings} onTextSettingsChange={mockOnTextSettingsChange} canvas={mockCanvas} />
		);
		// 第一個 slider 是 fontWeight
		const sliders = getAllByRole("slider");
		fireEvent.change(sliders[0], { target: { value: 7 } }); // index 7 = "800"
		await waitFor(() => {
			expect(mockOnTextSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ fontWeight: "800" }));
		});
	});

	it("調整字型大小滑桿時會正確呼叫 onTextSettingsChange 並帶入正確 fontSize", async () => {
		const textSettings = {
			fontFamily: '"Noto Sans TC", sans-serif',
			fontSize: 24,
			fill: "#000000",
			fontWeight: "400",
		};
		const { getAllByRole } = render(
			<TextSettings textSettings={textSettings} onTextSettingsChange={mockOnTextSettingsChange} canvas={mockCanvas} />
		);
		// 第二個 slider 是 fontSize
		const sliders = getAllByRole("slider");
		fireEvent.change(sliders[1], { target: { value: 30 } });
		await waitFor(() => {
			expect(mockOnTextSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ fontSize: 30 }));
		});
	});

	it("調整顏色時會正確呼叫 onTextSettingsChange 並帶入正確 fill", async () => {
		const textSettings = {
			fontFamily: '"Noto Sans TC", sans-serif',
			fontSize: 24,
			fill: "#000000",
			fontWeight: "400",
		};
		const { getByLabelText } = render(
			<TextSettings textSettings={textSettings} onTextSettingsChange={mockOnTextSettingsChange} canvas={mockCanvas} />
		);
		// 直接 fireEvent.change
		const colorInput = getByLabelText("文字顏色");
		fireEvent.change(colorInput, { target: { value: "#ff0000" } });
		await waitFor(() => {
			expect(mockOnTextSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ fill: "#ff0000" }));
		});
	});
});
