import React, { useState } from "react";
import PropTypes from "prop-types";
import {
	Box,
	Slider,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Switch,
	FormControlLabel,
} from "@mui/material";
import ColorPicker from "../color/ColorPicker";

const BrushSettings = ({ brushSettings, onBrushSettingsChange }) => {
	const [showShadowSettings, setShowShadowSettings] = useState(Boolean(brushSettings.shadow));

	const handleSizeChange = (event, newValue) => {
		onBrushSettingsChange({ ...brushSettings, size: newValue });
	};

	const handleOpacityChange = (event, newValue) => {
		onBrushSettingsChange({ ...brushSettings, opacity: newValue });
	};

	const handleBrushTypeChange = (event) => {
		onBrushSettingsChange({ ...brushSettings, type: event.target.value });
	};

	const handleColorChange = (event) => {
		onBrushSettingsChange({ ...brushSettings, color: event.target.value });
	};

	const handleShadowToggle = (event) => {
		const checked = event.target.checked;
		setShowShadowSettings(checked);

		if (checked) {
			const shadowSettings = {
				blur: 5,
				offsetX: 0,
				offsetY: 0,
				color: "#000000",
			};
			onBrushSettingsChange({ ...brushSettings, shadow: shadowSettings });
		} else {
			const newSettings = { ...brushSettings };
			delete newSettings.shadow;
			onBrushSettingsChange(newSettings);
		}
	};

	const handleShadowChange = (property, value) => {
		onBrushSettingsChange({
			...brushSettings,
			shadow: {
				...brushSettings.shadow,
				[property]: value,
			},
		});
	};

	return (
		<>
			<FormControl fullWidth margin="normal">
				<InputLabel id="brush-type-label">畫筆類型</InputLabel>
				<Select
					labelId="brush-type-label"
					id="brush-type-select"
					value={brushSettings.type}
					label="畫筆類型"
					onChange={handleBrushTypeChange}
				>
					<MenuItem value="PencilBrush">鉛筆</MenuItem>
					<MenuItem value="CircleBrush">圓點</MenuItem>
					<MenuItem value="SprayBrush">噴霧</MenuItem>
					<MenuItem value="PatternBrush">棋盤</MenuItem>
					<MenuItem value="VLineBrush">水平線</MenuItem>
					<MenuItem value="HLineBrush">垂直線</MenuItem>
					<MenuItem value="SquareBrush">方塊</MenuItem>
					<MenuItem value="DiamondBrush">菱形</MenuItem>
				</Select>
			</FormControl>

			<ColorPicker label="顏色" value={brushSettings.color} onChange={handleColorChange} />

			<Typography gutterBottom sx={{ mt: 2 }}>
				筆刷粗細
			</Typography>
			<Slider
				value={brushSettings.size}
				onChange={handleSizeChange}
				aria-labelledby="brush-size-slider"
				min={1}
				max={50}
				valueLabelDisplay="auto"
			/>

			<Typography gutterBottom>透明度</Typography>
			<Slider
				value={brushSettings.opacity}
				onChange={handleOpacityChange}
				aria-labelledby="brush-opacity-slider"
				min={0.1}
				max={1}
				step={0.1}
				valueLabelDisplay="auto"
			/>

			<FormControlLabel
				control={<Switch checked={showShadowSettings} onChange={handleShadowToggle} />}
				label="啟用陰影"
				sx={{ mt: 2 }}
			/>

			{showShadowSettings && (
				<Box sx={{ mt: 1 }}>
					<Typography gutterBottom>陰影模糊</Typography>
					<Slider
						value={brushSettings.shadow?.blur || 0}
						onChange={(e, val) => handleShadowChange("blur", val)}
						min={0}
						max={50}
						valueLabelDisplay="auto"
					/>

					<Typography gutterBottom>陰影顏色</Typography>
					<ColorPicker
						value={brushSettings.shadow?.color || "#000000"}
						onChange={(e) => handleShadowChange("color", e.target.value)}
						sx={{ mb: 2, mt: 0 }}
					/>

					<Typography gutterBottom>水平陰影偏移</Typography>
					<Slider
						value={brushSettings.shadow?.offsetX || 0}
						onChange={(e, val) => handleShadowChange("offsetX", val)}
						min={-50}
						max={50}
						valueLabelDisplay="auto"
					/>

					<Typography gutterBottom sx={{ mt: 2 }}>
						垂直陰影偏移
					</Typography>
					<Slider
						value={brushSettings.shadow?.offsetY || 0}
						onChange={(e, val) => handleShadowChange("offsetY", val)}
						min={-50}
						max={50}
						valueLabelDisplay="auto"
					/>
				</Box>
			)}
		</>
	);
};

BrushSettings.propTypes = {
	brushSettings: PropTypes.object.isRequired,
	onBrushSettingsChange: PropTypes.func.isRequired,
};

export default BrushSettings;
