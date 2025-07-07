import React from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, Select, MenuItem, Typography, Slider } from "@mui/material";
import ColorPicker from "../color/ColorPicker";

const TextSettings = ({ textSettings, onTextSettingsChange }) => {
	const handleFontFamilyChange = async (event) => {
		const newFontFamily = event.target.value;
		// 先等待字型載入完成
		try {
			const fontName = newFontFamily.split(",")[0].replace(/['"]/g, "").trim();
			await document.fonts.load(`24px ${fontName}`);
		} catch (e) {
			console.error("字型載入失敗或瀏覽器不支援 document.fonts：", e);
		}
		onTextSettingsChange({
			...textSettings,
			fontFamily: newFontFamily,
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

	return (
		<>
			<FontPreload />
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

function FontPreload() {
	return (
		<div
			style={{
				position: "absolute",
				width: 0,
				height: 0,
				overflow: "hidden",
				opacity: 0,
				pointerEvents: "none",
				zIndex: -9999,
			}}
		>
			<span style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>預載字體，請輸入文字</span>
			<span style={{ fontFamily: '"Noto Serif TC", serif' }}>預載字體，請輸入文字</span>
		</div>
	);
}

TextSettings.propTypes = {
	textSettings: PropTypes.shape({
		fontFamily: PropTypes.string.isRequired,
		fontSize: PropTypes.number.isRequired,
		fill: PropTypes.string.isRequired,
	}).isRequired,
	onTextSettingsChange: PropTypes.func.isRequired,
};

export default TextSettings;
