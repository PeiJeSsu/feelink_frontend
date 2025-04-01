import React from "react";
import PropTypes from "prop-types";
import {
	Box,
	Popover,
	Typography,
	Divider,
	IconButton,
	Tooltip,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

const SettingsPopover = ({ open, anchorEl, onClose, title, children }) => {
	return (
		<Popover aria-hidden="false"
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{
				vertical: "center",
				horizontal: "right",
			}}
			transformOrigin={{
				vertical: "center",
				horizontal: "left",
			}}
			disableRestoreFocus
			disableEnforceFocus
			disableAutoFocus
			slotProps={{
				paper: {
					style: {
						pointerEvents: "auto",
						marginLeft: "14px",
						backgroundColor: "#f5f5e9",
						borderRadius: "12px",
						border: "1px solid rgba(92, 92, 92, 0.15)",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
					},
				},
			}}
			style={{ pointerEvents: "none" }}
		>
			<Box className="brush-settings-popover">
				<Box className="popover-header">
					<Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#333333" }}>
						{title}
					</Typography>
					<Tooltip title="收起">
						<IconButton 
							size="small" 
							onClick={onClose}
							sx={{
								color: "#5c5c5c",
								"&:hover": {
									backgroundColor: "rgba(247, 202, 201, 0.2)",
									color: "#333333"
								}
							}}
						>
							<ChevronLeft />
						</IconButton>
					</Tooltip>
				</Box>
				<Divider sx={{ my: 1, backgroundColor: "rgba(92, 92, 92, 0.15)" }} />
				{children}
			</Box>
		</Popover>
	);
};

SettingsPopover.propTypes = {
	open: PropTypes.bool.isRequired,
	anchorEl: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

export default SettingsPopover;
