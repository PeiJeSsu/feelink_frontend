import React from "react";
import PropTypes from "prop-types";
import {
	Slider,
	Typography,
	FormControl,
	FormControlLabel,
	RadioGroup,
	Radio,
} from "@mui/material";

const EraserSettings = ({ eraserSettings, onEraserSettingsChange }) => {
	const handleSizeChange = (event, newValue) => {
		onEraserSettingsChange({ ...eraserSettings, size: newValue });
	};

	const handleTypeChange = (event) => {
		onEraserSettingsChange({ ...eraserSettings, type: event.target.value });
	};

	return (
		<>
			<FormControl component="fieldset" sx={{ mb: 2 }}>
				<Typography gutterBottom>橡皮擦類型</Typography>
				<RadioGroup
					aria-label="eraser-type"
					name="eraser-type"
					value={eraserSettings.type || "object"}
					onChange={handleTypeChange}
				>
					<FormControlLabel value="object" control={<Radio />} label="物件橡皮擦" />
					<FormControlLabel value="path" control={<Radio />} label="筆跡橡皮擦" />
				</RadioGroup>
			</FormControl>

			<Typography gutterBottom sx={{ mt: 2 }}>
				橡皮擦大小
			</Typography>
			<Slider
				value={eraserSettings.size}
				onChange={handleSizeChange}
				aria-labelledby="eraser-size-slider"
				min={5}
				max={100}
				valueLabelDisplay="auto"
			/>
		</>
	);
};

EraserSettings.propTypes = {
	eraserSettings: PropTypes.object.isRequired,
	onEraserSettingsChange: PropTypes.func.isRequired,
};

export default EraserSettings;
