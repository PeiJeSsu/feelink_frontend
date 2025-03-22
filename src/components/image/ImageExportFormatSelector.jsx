import React from "react";
import PropTypes from "prop-types";
import { Box, Button, Typography, FormControlLabel, Checkbox, FormGroup, Grid2 } from "@mui/material";
const ImageExportFormatSelector = ({ format, onFormatChange, transparentBg, onTransparentBgChange }) => {
	return (
		<Box>
			<Typography variant="subtitle1" gutterBottom>
				選項
			</Typography>
			<FormGroup>
				<FormControlLabel
					control={
						<Checkbox
							checked={transparentBg}
							onChange={(e) => onTransparentBgChange(e.target.checked)}
							disabled={format === "jpg"}
						/>
					}
					label="透明背景 (僅 PNG 生效)"
				/>
			</FormGroup>
			<Box sx={{ mt: 2 }}>
				<Typography variant="subtitle2" gutterBottom>
					格式
				</Typography>
				<Grid2 container spacing={1}>
					<Grid2>
						<Button variant={format === "png" ? "contained" : "outlined"} onClick={() => onFormatChange("png")}>
							PNG
						</Button>
					</Grid2>
					<Grid2>
						<Button variant={format === "jpg" ? "contained" : "outlined"} onClick={() => onFormatChange("jpg")}>
							JPG
						</Button>
					</Grid2>
				</Grid2>
			</Box>
		</Box>
	);
};

ImageExportFormatSelector.propTypes = {
	format: PropTypes.string.isRequired,
	onFormatChange: PropTypes.func.isRequired,
	transparentBg: PropTypes.bool.isRequired,
	onTransparentBgChange: PropTypes.func.isRequired,
};

export default ImageExportFormatSelector;
