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
		<Popover
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
					},
				},
			}}
			style={{ pointerEvents: "none" }}
		>
			<Box className="brush-settings-popover">
				<Box className="popover-header">
					<Typography variant="subtitle1" fontWeight="bold">
						{title}
					</Typography>
					<Tooltip title="收起">
						<IconButton size="small" onClick={onClose}>
							<ChevronLeft />
						</IconButton>
					</Tooltip>
				</Box>
				<Divider sx={{ my: 1 }} />
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
