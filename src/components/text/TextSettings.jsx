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
					{/* 英文字體 */}
					<MenuItem value="Arial">Arial</MenuItem>
					<MenuItem value="Times New Roman">Times New Roman</MenuItem>
					<MenuItem value="Helvetica">Helvetica</MenuItem>
					<MenuItem value="Georgia">Georgia</MenuItem>
					<MenuItem value="Verdana">Verdana</MenuItem>
					<MenuItem value="Trebuchet MS">Trebuchet MS</MenuItem>
					<MenuItem value="Impact">Impact</MenuItem>
					<MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
					<MenuItem value="Courier New">Courier New</MenuItem>
					<MenuItem value="Palatino">Palatino</MenuItem>
					<MenuItem value="Tahoma">Tahoma</MenuItem>
					<MenuItem value="Calibri">Calibri</MenuItem>
					<MenuItem value="Consolas">Consolas</MenuItem>
					
					{/* 中文字體 */}
					<MenuItem value='"Noto Sans TC", "Microsoft JhengHei", "微軟正黑體", "PingFang TC", "Hiragino Sans TC", "Heiti TC", "Apple LiGothic Medium", sans-serif'>微軟正黑體</MenuItem>
					<MenuItem value='"Noto Serif TC", "DFKai-SB", "標楷體", "BiauKai", "Kaiti TC", serif'>標楷體</MenuItem>
					<MenuItem value='"Microsoft YaHei", "微軟雅黑", "SimHei", "黑體", "Heiti SC", "PingFang SC", sans-serif'>微軟雅黑</MenuItem>
					<MenuItem value='"SimSun", "宋體", "NSimSun", "新宋體", "Song TC", "Songti SC", serif'>宋體</MenuItem>
					<MenuItem value='"PMingLiU", "新細明體", "MingLiU", "細明體", "Ming", serif'>新細明體</MenuItem>
					<MenuItem value='"Microsoft JhengHei UI", "微軟正黑體 UI", "PingFang TC", sans-serif'>微軟正黑體 UI</MenuItem>
					<MenuItem value='"LiSu", "隸書", "Baoli SC", cursive'>隸書</MenuItem>
					<MenuItem value='"YouYuan", "幼圓", "Yuanti SC", fantasy'>幼圓</MenuItem>
					<MenuItem value='"FangSong", "仿宋", "FangSong_GB2312", "仿宋_GB2312", serif'>仿宋</MenuItem>
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
