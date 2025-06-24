import React from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, Select, MenuItem, Typography, Slider } from "@mui/material";
import ColorPicker from "../color/ColorPicker";

const TextSettings = ({ textSettings, onTextSettingsChange }) => {
	const handleFontFamilyChange = (event) => {
		onTextSettingsChange({
			...textSettings,
			fontFamily: event.target.value,
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
			<FormControl fullWidth margin="normal">
				<InputLabel id="font-family-label">字型</InputLabel>
				<Select
					labelId="font-family-label"
					id="font-family-select"
					value={textSettings.fontFamily}
					label="字型"
					onChange={handleFontFamilyChange}
				>
					<MenuItem value="Arial">Arial</MenuItem>
					<MenuItem value="Times New Roman">Times New Roman</MenuItem>
					<MenuItem value="微軟正黑體">微軟正黑體</MenuItem>
					<MenuItem value="標楷體">標楷體</MenuItem>
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

TextSettings.propTypes = {
	textSettings: PropTypes.shape({
		fontFamily: PropTypes.string.isRequired,
		fontSize: PropTypes.number.isRequired,
		fill: PropTypes.string.isRequired,
	}).isRequired,
	onTextSettingsChange: PropTypes.func.isRequired,
};

export default TextSettings;
