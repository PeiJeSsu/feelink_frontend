import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, Select, MenuItem, Typography, Slider } from "@mui/material";
import ColorPicker from "../color/ColorPicker";

const chineseFontWeights = [
	{ value: "100", label: "Thin (100)" },
	{ value: "200", label: "ExtraLight (200)" },
	{ value: "300", label: "Light (300)" },
	{ value: "400", label: "Regular (400)" },
	{ value: "500", label: "Medium (500)" },
	{ value: "600", label: "SemiBold (600)" },
	{ value: "700", label: "Bold (700)" },
	{ value: "800", label: "ExtraBold (800)" },
	{ value: "900", label: "Black (900)" },
];

const englishFontWeights = [
	{ value: "200", label: "ExtraLight (200)" },
	{ value: "300", label: "Light (300)" },
	{ value: "400", label: "Regular (400)" },
	{ value: "500", label: "Medium (500)" },
	{ value: "600", label: "SemiBold (600)" },
	{ value: "800", label: "ExtraBold (800)" },
];

const fontWeightOptions = {
	'"Noto Sans TC", sans-serif': chineseFontWeights,
	'"Noto Serif TC", serif': chineseFontWeights,
	"Arial, sans-serif": englishFontWeights,
	'"Times New Roman", serif': englishFontWeights,
};

const TextSettings = ({ textSettings, onTextSettingsChange, canvas }) => {
	// 當使用者切換字型時，先預載所有 textbox 內的字，避免 webfont 懶加載導致部分字型沒換
	const handleFontFamilyChange = async (event) => {
		const newFontFamily = event.target.value;
		// 預設值，確保至少有一個字被載入
		let allText = "佔位";
		if (canvas && typeof canvas.getObjects === "function") {
			const allTextboxes = canvas.getObjects().filter((obj) => obj.type === "textbox");
			allText = allTextboxes.map((obj) => obj.text).join("") || "佔位";
		}
		try {
			const fontName = newFontFamily.split(",")[0].replace(/['"]/g, "").trim();
			await document.fonts.load(`24px ${fontName}`, allText);
		} catch (e) {
			console.error("字型載入失敗或瀏覽器不支援 document.fonts：", e);
		}
		onTextSettingsChange({
			...textSettings,
			fontFamily: newFontFamily,
			fontWeight: textSettings.fontWeight || "400",
		});
	};

	const handleFontSizeChange = (event, newValue) => {
		onTextSettingsChange({
			...textSettings,
			fontSize: newValue,
		});
	};

	const handleColorChange = (event) => {
		onTextSettingsChange({
			...textSettings,
			fill: event.target.value,
		});
	};

	const availableWeights = useMemo(() => {
		return fontWeightOptions[textSettings.fontFamily] || [];
	}, [textSettings.fontFamily]);

	const fontWeightIndex = useMemo(() => {
		if (textSettings.fontWeight) {
			const idx = availableWeights.findIndex((opt) => String(opt.value) === String(textSettings.fontWeight));
			if (idx !== -1) return idx;
		}
		// 沒有指定 fontWeight 時，預設找 400（Regular），找不到再找 normal，再找不到就 0
		let idx = availableWeights.findIndex((opt) => String(opt.value) === "400");
		if (idx === -1) idx = availableWeights.findIndex((opt) => String(opt.value).toLowerCase() === "normal");
		if (idx === -1) idx = 0;
		return idx;
	}, [availableWeights, textSettings.fontWeight]);
	const sliderValue = fontWeightIndex;

	return (
		<>
			<FormControl fullWidth margin="normal">
				<InputLabel id="font-family-label">字型</InputLabel>
				<Select
					labelId="font-family-label"
					id="font-family-select"
					value={textSettings.fontFamily}
					label="字型"
					onChange={handleFontFamilyChange}
				>
					{/* 中文字型 */}
					<MenuItem value='"Noto Sans TC", sans-serif'>思源黑體</MenuItem>
					<MenuItem value='"Noto Serif TC", serif'>思源宋體</MenuItem>
					{/* 英文字型 */}
					<MenuItem value="Arial, sans-serif">Arial</MenuItem>
					<MenuItem value='"Times New Roman", serif'>Times New Roman</MenuItem>
				</Select>
			</FormControl>

			{/* 字型粗細滑桿 */}
			{availableWeights.length > 0 && (
				<>
					<Typography gutterBottom sx={{ mt: 2 }}>
						字型粗細：{availableWeights[sliderValue].label}
					</Typography>
					<Slider
						min={0}
						max={availableWeights.length - 1}
						step={1}
						value={sliderValue}
						onChange={(_, idx) => {
							onTextSettingsChange({
								...textSettings,
								fontWeight: availableWeights[idx].value,
							});
						}}
						valueLabelDisplay="off"
						valueLabelFormat={(idx) => `${availableWeights[idx].label}`}
						marks={availableWeights.map((opt, idx) => ({ value: idx, label: opt.value }))}
					/>
				</>
			)}

			<Typography gutterBottom sx={{ mt: 2 }}>
				字型大小
			</Typography>
			<Slider
				value={textSettings.fontSize}
				onChange={handleFontSizeChange}
				aria-labelledby="font-size-slider"
				min={12}
				max={72}
				valueLabelDisplay="auto"
			/>

			<ColorPicker label="文字顏色" value={textSettings.fill} onChange={handleColorChange} />
		</>
	);
};

TextSettings.propTypes = {
	textSettings: PropTypes.shape({
		fontFamily: PropTypes.string.isRequired,
		fontSize: PropTypes.number.isRequired,
		fill: PropTypes.string.isRequired,
		fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	}).isRequired,
	onTextSettingsChange: PropTypes.func.isRequired,
	canvas: PropTypes.object,
};

export default TextSettings;
