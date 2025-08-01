import PropTypes from "prop-types";
import { Box, IconButton, Tooltip, Badge } from "@mui/material";
import { Brush, FormatShapes, AdsClick, AutoFixHigh, PanTool, FormatPaint, Title } from "@mui/icons-material";

const LeftToolbarButtons = ({ activeTool, onToolClick }) => {
	// 工具列表
	const tools = [
		{ id: "select", icon: AdsClick, label: "選擇工具" },
		{ id: "pencil", icon: Brush, label: "畫筆工具" },
		{ id: "shape", icon: FormatShapes, label: "圖形工具" },
		{ id: "paintBucket", icon: FormatPaint, label: "填充工具" },
		{ id: "eraser", icon: AutoFixHigh, label: "橡皮擦工具" },
		{ id: "text", icon: Title, label: "文字工具" },
		{ id: "pan", icon: PanTool, label: "移動畫布工具" },
	];

	return (
		<Box sx={{ 
			display: "flex",
			flexDirection: "column",
			gap: "8px",
			padding: "8px"
		}}>
			{tools.map((tool) => {
				const IconComponent = tool.icon;
				const isSelected = activeTool === tool.id;
				return (
					<Tooltip key={tool.id} title={tool.label} placement="right" arrow>
						<IconButton
							id={tool.id === "pencil" ? "brush-button" : 
								tool.id === "shape" ? "shape-button" :
								tool.id === "eraser" ? "eraser-button" :
								tool.id === "paintBucket" ? "paint-bucket-button" :
								tool.id === "text" ? "text-button" :
								tool.id === "pan" ? "pan-button" : undefined}
							onClick={() => onToolClick(tool.id)}
							sx={{
								width: 48,
								height: 48,
								borderRadius: "12px",
								backgroundColor: isSelected ? "#2563eb" : "transparent",
								color: isSelected ? "#ffffff" : "#64748b",
								border: isSelected ? "none" : "1px solid transparent",
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									backgroundColor: isSelected ? "#1d4ed8" : "#f1f5f9",
									color: isSelected ? "#ffffff" : "#2563eb",
									transform: "translateY(-1px)",
									boxShadow: isSelected 
										? "0 4px 12px rgba(37, 99, 235, 0.3)" 
										: "0 2px 8px rgba(0, 0, 0, 0.1)",
								},
							}}
						>
							{isSelected && (
								<Badge
									color="secondary"
									variant="dot"
									sx={{
										"& .MuiBadge-badge": {
											backgroundColor: "#ffffff",
											width: 6,
											height: 6,
											minWidth: 6,
										},
									}}
								>
									<IconComponent sx={{ fontSize: 20 }} />
								</Badge>
							)}
							{!isSelected && <IconComponent sx={{ fontSize: 20 }} />}
						</IconButton>
					</Tooltip>
				);
			})}
		</Box>
	);
};

LeftToolbarButtons.propTypes = {
	activeTool: PropTypes.string.isRequired,
	onToolClick: PropTypes.func.isRequired,
};

export default LeftToolbarButtons;
