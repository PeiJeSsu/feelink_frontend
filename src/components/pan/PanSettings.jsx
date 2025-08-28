import PropTypes from "prop-types";
import { Box, Typography, Alert } from "@mui/material";
import { PanTool, Mouse, TouchApp } from "@mui/icons-material";

const PanSettings = ({ canvas }) => {
	return (
		<Box sx={{ padding: "12px 8px", height: "100%", overflow: "auto" }}>
			{/* 提醒訊息 */}
			<Alert 
				severity="info" 
				sx={{ 
					marginBottom: "20px",
					marginX: "0px", 
					"& .MuiAlert-message": {
						fontFamily: '"Noto Sans TC", sans-serif',
						width: "100%",
					},
					"& .MuiAlert-message *": {
						fontFamily: '"Noto Sans TC", sans-serif !important',
					}
				}}
			>
				<Typography 
					component="div"
					sx={{ 
						fontSize: "16px !important", 
						fontWeight: "600 !important", 
						color: "#1e293b !important",
						fontFamily: '"Noto Sans TC", sans-serif !important',
						marginBottom: "12px",
						lineHeight: 1.3,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<PanTool sx={{ fontSize: "18px" }} />
						移動畫布工具
					</Box>
				</Typography>
				<Typography 
					component="div"
					sx={{ 
						fontSize: "12px !important", 
						color: "#64748b !important",
						fontFamily: '"Noto Sans TC", sans-serif !important',
						lineHeight: 1.4,
						marginBottom: "8px",
					}}
				>
					使用此工具來移動和瀏覽畫布區域
				</Typography>
			</Alert>

			{/* 操作說明區塊 */}
			<Box sx={{ marginBottom: "24px", marginX: "0px" }}>
				<Typography 
					sx={{ 
						fontSize: "14px !important",
						fontWeight: "600 !important",
						color: "#374151 !important",
						marginBottom: "16px",
						fontFamily: '"Noto Sans TC", sans-serif !important',
					}}
				>
					操作說明
				</Typography>

				{/* 電腦端操作 */}
				<Box sx={{ 
					marginBottom: "16px",
					padding: "12px",
					backgroundColor: "#f8fafc",
					borderRadius: "8px",
					border: "1px solid #e2e8f0"
				}}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "8px" }}>
						<Mouse sx={{ fontSize: "16px", color: "#6b7280" }} />
						<Typography 
							sx={{ 
								fontSize: "13px !important",
								fontWeight: "600 !important",
								color: "#374151 !important",
								fontFamily: '"Noto Sans TC", sans-serif !important',
							}}
						>
							電腦端操作
						</Typography>
					</Box>
					<Typography 
						sx={{ 
							fontSize: "12px !important",
							color: "#6b7280 !important",
							fontFamily: '"Noto Sans TC", sans-serif !important',
							lineHeight: 1.5,
						}}
					>
						<Box component="span" sx={{ display: "block", marginBottom: "4px" }}>
							• 移動工具：按住滑鼠左鍵拖移
						</Box>
						<Box component="span" sx={{ display: "block" }}>
							• 其他工具下：按住滑鼠中鍵拖移
						</Box>
					</Typography>
				</Box>

				{/* 平板端操作 */}
				<Box sx={{ 
					padding: "12px",
					backgroundColor: "#f0f9ff",
					borderRadius: "8px",
					border: "1px solid #bae6fd"
				}}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "8px" }}>
						<TouchApp sx={{ fontSize: "16px", color: "#0ea5e9" }} />
						<Typography 
							sx={{ 
								fontSize: "13px !important",
								fontWeight: "600 !important",
								color: "#374151 !important",
								fontFamily: '"Noto Sans TC", sans-serif !important',
							}}
						>
							平板端操作
						</Typography>
					</Box>
					<Typography 
						sx={{ 
							fontSize: "12px !important",
							color: "#6b7280 !important",
							fontFamily: '"Noto Sans TC", sans-serif !important',
							lineHeight: 1.5,
						}}
					>
						<Box component="span" sx={{ display: "block", marginBottom: "4px" }}>
							• 單指拖移即可移動畫布
						</Box>
						<Box component="span" sx={{ display: "block" }}>
							• 雙指縮放調整畫布比例
						</Box>
					</Typography>
				</Box>
			</Box>

			{/* 提示區塊 */}
			<Box sx={{ 
				padding: "12px",
				backgroundColor: "#fefce8",
				borderRadius: "8px",
				border: "1px solid #fde047"
			}}>
				<Typography 
					sx={{ 
						fontSize: "12px !important",
						color: "#a16207 !important",
						fontFamily: '"Noto Sans TC", sans-serif !important',
						lineHeight: 1.5,
						fontWeight: "500 !important",
					}}
				>
					💡 提示：移動工具啟用時，物件將無法選取。如需編輯物件，請切換回選擇工具。
				</Typography>
			</Box>
		</Box>
	);
};

PanSettings.propTypes = {
	canvas: PropTypes.object,
};

export default PanSettings;
