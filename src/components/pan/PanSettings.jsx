import { Box, Typography, Alert } from "@mui/material";
import { MouseOutlined, TouchAppOutlined } from "@mui/icons-material";

const PanSettings = () => {
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
						檢視模式
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
					專門用於瀏覽和導航畫布
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
					backgroundColor: "#F9FAFB",
					borderRadius: "8px",
					border: "1px solid #CBD5E1"
				}}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "8px" }}>
						<MouseOutlined sx={{ fontSize: "24px", color: "#4B5563" }} />
						<Typography 
							sx={{ 
								fontSize: "14px !important",
								fontWeight: "600 !important",
								color: "#1F2937 !important",
								fontFamily: '"Noto Sans TC", sans-serif !important',
							}}
						>
							電腦端操作
						</Typography>
					</Box>
					<Typography 
						sx={{ 
							fontSize: "12px !important",
							color: "#374151 !important",
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
					backgroundColor: "#F9FAFB",
					borderRadius: "8px",
					border: "1px solid #CBD5E1"
				}}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "8px" }}>
						<TouchAppOutlined sx={{ fontSize: "24px", color: "#4B5563" }} />
						<Typography 
							sx={{ 
								fontSize: "14px !important",
								fontWeight: "600 !important",
								color: "#1F2937 !important",
								fontFamily: '"Noto Sans TC", sans-serif !important',
							}}
						>
							平板端操作
						</Typography>
					</Box>
					<Typography 
						sx={{ 
							fontSize: "12px !important",
							color: "#374151 !important",
							fontFamily: '"Noto Sans TC", sans-serif !important',
							lineHeight: 1.5,
						}}
					>
						<Box component="span" sx={{ display: "block", marginBottom: "4px" }}>
							• 移動工具：單指拖移即可移動畫布
						</Box>
						<Box component="span" sx={{ display: "block" }}>
							• 其他工具下：雙指縮放畫布+移動畫布
						</Box>
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};


export default PanSettings;
