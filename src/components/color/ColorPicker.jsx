import React, { useState } from "react";
import PropTypes from "prop-types";
import { Add } from "@mui/icons-material";
import { Box, TextField, Grid2, IconButton, Tooltip, Typography } from "@mui/material";
import { getColorInfo } from "../../helpers/color/ColorProcess";

const ColorPicker = ({ label, value, onChange, disabled = false, sx = {} }) => {
	const [savedColors, setSavedColors] = useState([]);

	const handleAddColor = () => {
		if (!savedColors.includes(value)) {
			setSavedColors((prev) => [...prev, value]);
		}
	};

	const handleDeleteColor = (colorToDelete, event) => {
		event.preventDefault(); // 防止右鍵選單出現
		setSavedColors((prev) => prev.filter((color) => color !== colorToDelete));
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", mt: 2, ...sx }}>
			<Box sx={{ display: "flex", alignItems: "center" }}>
				<TextField
					label={label}
					type="color"
					value={value}
					onChange={onChange}
					sx={{ flex: 1, minWidth: "85%" }}
					disabled={disabled}
				/>
				<Tooltip title="儲存當前顏色">
					<IconButton
						onClick={handleAddColor}
						disabled={disabled}
						sx={{
							color: "#5c5c5c",
							minWidth: "20px",
							"&:hover": {
								backgroundColor: "rgba(247, 202, 201, 0.2)",
								color: "#333333",
							},
						}}
					>
						<Add />
					</IconButton>
				</Tooltip>
			</Box>

			{savedColors.length > 0 && (
				<Grid2 container spacing={1} sx={{ mt: 1 }}>
					{savedColors.map((color) => {
						const colorInfo = getColorInfo(color);
						return (
							<Grid2 item key={color}>
								<Tooltip
									title={
										<Box sx={{ p: 1 }}>
											<Typography variant="caption" display="block">
												十六進位: {colorInfo.hex}
											</Typography>
											<Typography variant="caption" display="block">
												RGB: {colorInfo.rgb}
											</Typography>
											<Typography variant="caption" display="block" sx={{ mt: 1 }}>
												右鍵點擊刪除
											</Typography>
										</Box>
									}
								>
									<Box
										sx={{
											width: 30,
											height: 30,
											backgroundColor: color,
											borderRadius: 1,
											cursor: "pointer",
											border: "1px solid #ccc",
											position: "relative",
											"&:hover": {
												transform: "scale(1.1)",
												transition: "transform 0.2s",
											},
										}}
										onClick={() => onChange({ target: { value: color } })}
										onContextMenu={(e) => handleDeleteColor(color, e)}
									/>
								</Tooltip>
							</Grid2>
						);
					})}
				</Grid2>
			)}
		</Box>
	);
};

ColorPicker.propTypes = {
	label: PropTypes.string,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	sx: PropTypes.object,
};

export default ColorPicker;
