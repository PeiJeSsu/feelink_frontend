import React from "react";
import PropTypes from "prop-types";
import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Switch,
	FormControlLabel,
	Typography,
	Slider,
} from "@mui/material";
import ColorPicker from "../color/ColorPicker";

const ShapeSettings = ({ shapeSettings, onShapeSettingsChange }) => {
	const handleShapeTypeChange = (event) => {
		onShapeSettingsChange({ ...shapeSettings, type: event.target.value });
	};

	const handleShapeColorChange = (event) => {
		const newColor = event.target.value;
		onShapeSettingsChange({
			...shapeSettings,
			color: newColor,
			fill: shapeSettings.fill !== "transparent" ? newColor : shapeSettings.fill,
		});
	};

	const handleStrokeColorChange = (event) => {
		onShapeSettingsChange({ ...shapeSettings, stroke: event.target.value });
	};

	const handleStrokeWidthChange = (event, newValue) => {
		onShapeSettingsChange({ ...shapeSettings, strokeWidth: newValue });
	};

	const handleFillToggle = (event) => {
		const checked = event.target.checked;
		onShapeSettingsChange({
			...shapeSettings,
			fill: checked ? shapeSettings.color : "transparent",
		});
	};

	const handleStrokeToggle = (event) => {
		const checked = event.target.checked;
		onShapeSettingsChange({
			...shapeSettings,
			showStroke: checked,
			strokeWidth: checked ? shapeSettings.strokeWidth || 2 : 0,
		});
	};

	return (
		<>
			<FormControl fullWidth margin="normal">
				<InputLabel id="shape-type-label">圖形類型</InputLabel>
				<Select
					labelId="shape-type-label"
					id="shape-type-select"
					value={shapeSettings.type}
					label="圖形類型"
					onChange={handleShapeTypeChange}
				>
					<MenuItem value="RECT">矩形</MenuItem>
					<MenuItem value="CIRCLE">圓形</MenuItem>
					<MenuItem value="TRIANGLE">三角形</MenuItem>
					<MenuItem value="ELLIPSE">橢圓</MenuItem>
					<MenuItem value="LINE">直線</MenuItem>
				</Select>
			</FormControl>

			<FormControlLabel
				control={
					<Switch
						checked={shapeSettings.fill !== "transparent"}
						onChange={handleFillToggle}
					/>
				}
				label="填充"
				sx={{ mt: 2 }}
			/>

			<FormControlLabel
				control={
					<Switch checked={shapeSettings.showStroke} onChange={handleStrokeToggle} />
				}
				label="邊框"
				sx={{ mt: 2 }}
			/>

			<ColorPicker
				label="填充顏色"
				value={shapeSettings.color}
				onChange={handleShapeColorChange}
				disabled={shapeSettings.fill === "transparent"}
			/>

			<ColorPicker
				label="邊框顏色"
				value={shapeSettings.stroke}
				onChange={handleStrokeColorChange}
				disabled={!shapeSettings.showStroke}
			/>

			<Typography gutterBottom sx={{ mt: 2 }}>
				邊框粗細
			</Typography>
			<Slider
				value={shapeSettings.strokeWidth}
				onChange={handleStrokeWidthChange}
				aria-labelledby="stroke-width-slider"
				min={1}
				max={20}
				valueLabelDisplay="auto"
				disabled={!shapeSettings.showStroke}
			/>
		</>
	);
};

ShapeSettings.propTypes = {
	shapeSettings: PropTypes.object.isRequired,
	onShapeSettingsChange: PropTypes.func.isRequired,
};

export default ShapeSettings;
