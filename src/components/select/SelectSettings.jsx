import React from "react";
import PropTypes from "prop-types";
import { Box, Button, Typography, Alert } from "@mui/material";
import { 
	ContentCut, 
	ContentCopy, 
	ContentPaste, 
	GroupAdd, 
	GroupRemove 
} from "@mui/icons-material";
import { cut, copy, paste, hasClipboardContent } from "../../helpers/clipboard/ClipboardOperations";
import { groupSelectedObjects, ungroupSelectedGroup } from "../../helpers/group/GroupUtils";
import * as fabric from "fabric";

const SelectSettings = ({ canvas }) => {
	const [hasSelectedObject, setHasSelectedObject] = React.useState(false);
	const [canPaste, setCanPaste] = React.useState(false);
	const [canGroup, setCanGroup] = React.useState(false);
	const [canUngroup, setCanUngroup] = React.useState(false);

	// 監聽選取狀態變化
	React.useEffect(() => {
		const handleSelection = () => {
			const activeObject = canvas?.getActiveObject();
			setHasSelectedObject(!!activeObject);
			
			// 判斷是否可以群組：需要選擇多個物件
			setCanGroup(
				activeObject &&
				(activeObject instanceof fabric.ActiveSelection ||
					(activeObject.forEachObject && typeof activeObject.forEachObject === "function")) &&
				activeObject.size &&
				activeObject.size() > 1
			);
			
			// 判斷是否可以解散群組：選擇的是群組物件
			setCanUngroup(activeObject && activeObject.type === "group");
		};

		if (canvas) {
			canvas.on("selection:created", handleSelection);
			canvas.on("selection:updated", handleSelection);
			canvas.on("selection:cleared", handleSelection);
			
			// 初始檢查
			handleSelection();
		}

		return () => {
			if (canvas) {
				canvas.off("selection:created", handleSelection);
				canvas.off("selection:updated", handleSelection);
				canvas.off("selection:cleared", handleSelection);
			}
		};
	}, [canvas]);

	// 監聽剪貼簿狀態
	React.useEffect(() => {
		const checkClipboard = () => {
			setCanPaste(hasClipboardContent());
		};

		// 初始檢查
		checkClipboard();

		// 定期檢查剪貼簿狀態
		const interval = setInterval(checkClipboard, 100);

		return () => clearInterval(interval);
	}, []);

	// 剪貼簿操作處理
	const handleCut = () => {
		if (canvas && hasSelectedObject) {
			cut(canvas);
		}
	};

	const handleCopy = () => {
		if (canvas && hasSelectedObject) {
			copy(canvas);
		}
	};

	const handlePaste = () => {
		if (canvas && canPaste) {
			paste(canvas);
		}
	};

	// 群組操作處理
	const handleGroup = () => {
		if (canvas && canGroup) {
			groupSelectedObjects(canvas);
		}
	};

	const handleUngroup = () => {
		if (canvas && canUngroup) {
			ungroupSelectedGroup(canvas);
		}
	};

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
					請選取物件
				</Typography>
				<Typography 
					component="div"
					sx={{ 
						fontSize: "12px !important", 
						color: "#64748b !important",
						fontFamily: '"Noto Sans TC", sans-serif !important',
						lineHeight: 1.4,
					}}
				>
					選取畫布上的物件以使用編輯功能
				</Typography>
			</Alert>

			{/* 編輯區塊 */}
			<Box sx={{ marginBottom: "24px", marginX: "0px" }}>
				<Typography 
					variant="subtitle2" 
					sx={{ 
						fontSize: "12px", 
						fontWeight: 600, 
						color: "#64748b", 
						textTransform: "uppercase", 
						letterSpacing: "0.5px",
						marginBottom: "12px",
						fontFamily: '"Noto Sans TC", sans-serif',
					}}
				>
					編輯
				</Typography>
				
				<Box sx={{ display: "flex", gap: "8px" }}>
					<Button
						variant="ghost"
						disabled={!hasSelectedObject}
						onClick={handleCut}
						sx={{
							flex: 1,
							flexDirection: "column",
							height: "56px",
							gap: "4px",
							padding: "8px 4px",
							minWidth: "auto",
							borderRadius: "8px",
							border: "1px solid #94a3b8", // 更深的邊框顏色
							backgroundColor: "#fafafa", // 添加底色
							color: hasSelectedObject ? "#64748b" : "#94a3b8",
							"&:hover": {
								backgroundColor: hasSelectedObject ? "#f1f5f9" : "#fafafa",
								color: hasSelectedObject ? "#3b82f6" : "#94a3b8",
								borderColor: hasSelectedObject ? "#3b82f6" : "#94a3b8",
							},
							"&:disabled": {
								color: "#cbd5e1",
								borderColor: "#cbd5e1",
								backgroundColor: "#f8fafc",
							},
						}}
					>
						<ContentCut sx={{ fontSize: 16 }} />
						<Typography sx={{ fontSize: "12px", fontFamily: '"Noto Sans TC", sans-serif' }}>
							剪下
						</Typography>
					</Button>
					
					<Button
						variant="ghost"
						disabled={!hasSelectedObject}
						onClick={handleCopy}
						sx={{
							flex: 1,
							flexDirection: "column",
							height: "56px",
							gap: "4px",
							padding: "8px 4px",
							minWidth: "auto",
							borderRadius: "8px",
							border: "1px solid #94a3b8", // 更深的邊框顏色
							backgroundColor: "#fafafa", // 添加底色
							color: hasSelectedObject ? "#64748b" : "#94a3b8",
							"&:hover": {
								backgroundColor: hasSelectedObject ? "#f1f5f9" : "#fafafa",
								color: hasSelectedObject ? "#3b82f6" : "#94a3b8",
								borderColor: hasSelectedObject ? "#3b82f6" : "#94a3b8",
							},
							"&:disabled": {
								color: "#cbd5e1",
								borderColor: "#cbd5e1",
								backgroundColor: "#f8fafc",
							},
						}}
					>
						<ContentCopy sx={{ fontSize: 16 }} />
						<Typography sx={{ fontSize: "12px", fontFamily: '"Noto Sans TC", sans-serif' }}>
							複製
						</Typography>
					</Button>
					
					<Button
						variant="ghost"
						disabled={!canPaste}
						onClick={handlePaste}
						sx={{
							flex: 1,
							flexDirection: "column",
							height: "56px",
							gap: "4px",
							padding: "8px 4px",
							minWidth: "auto",
							borderRadius: "8px",
							border: "1px solid #94a3b8", // 更深的邊框顏色
							backgroundColor: "#fafafa", // 添加底色
							color: canPaste ? "#64748b" : "#94a3b8",
							"&:hover": {
								backgroundColor: canPaste ? "#f1f5f9" : "#fafafa",
								color: canPaste ? "#3b82f6" : "#94a3b8",
								borderColor: canPaste ? "#3b82f6" : "#94a3b8",
							},
							"&:disabled": {
								color: "#cbd5e1",
								borderColor: "#cbd5e1",
								backgroundColor: "#f8fafc",
							},
						}}
					>
						<ContentPaste sx={{ fontSize: 16 }} />
						<Typography sx={{ fontSize: "12px", fontFamily: '"Noto Sans TC", sans-serif' }}>
							貼上
						</Typography>
					</Button>
				</Box>
			</Box>

			{/* 群組區塊 */}
			<Box sx={{ marginX: "0px" }}>
				<Typography 
					variant="subtitle2" 
					sx={{ 
						fontSize: "12px", 
						fontWeight: 600, 
						color: "#64748b", 
						textTransform: "uppercase", 
						letterSpacing: "0.5px",
						marginBottom: "12px",
						fontFamily: '"Noto Sans TC", sans-serif',
					}}
				>
					群組
				</Typography>
				
				<Box sx={{ display: "flex", gap: "8px" }}>
					<Button
						variant="ghost"
						disabled={!canGroup}
						onClick={handleGroup}
						sx={{
							flex: 1,
							maxWidth: "calc(50% - 4px)", // 限制最大寬度，使其與編輯按鈕大小一致
							flexDirection: "column",
							height: "56px",
							gap: "4px",
							padding: "8px 4px",
							minWidth: "auto",
							borderRadius: "8px",
							border: "1px solid #94a3b8", // 更深的邊框顏色
							backgroundColor: "#fafafa", // 添加底色
							color: canGroup ? "#64748b" : "#94a3b8",
							"&:hover": {
								backgroundColor: canGroup ? "#f1f5f9" : "#fafafa",
								color: canGroup ? "#3b82f6" : "#94a3b8",
								borderColor: canGroup ? "#3b82f6" : "#94a3b8",
							},
							"&:disabled": {
								color: "#cbd5e1",
								borderColor: "#cbd5e1",
								backgroundColor: "#f8fafc",
							},
						}}
					>
						<GroupAdd sx={{ fontSize: 16 }} />
						<Typography sx={{ fontSize: "12px", fontFamily: '"Noto Sans TC", sans-serif' }}>
							建立群組
						</Typography>
					</Button>
					
					<Button
						variant="ghost"
						disabled={!canUngroup}
						onClick={handleUngroup}
						sx={{
							flex: 1,
							maxWidth: "calc(50% - 4px)", 
							flexDirection: "column",
							height: "56px",
							gap: "4px",
							padding: "8px 4px",
							minWidth: "auto",
							borderRadius: "8px",
							border: "1px solid #94a3b8", // 更深的邊框顏色
							backgroundColor: "#fafafa", // 添加底色
							color: canUngroup ? "#64748b" : "#94a3b8",
							"&:hover": {
								backgroundColor: canUngroup ? "#f1f5f9" : "#fafafa",
								color: canUngroup ? "#3b82f6" : "#94a3b8",
								borderColor: canUngroup ? "#3b82f6" : "#94a3b8",
							},
							"&:disabled": {
								color: "#cbd5e1",
								borderColor: "#cbd5e1",
								backgroundColor: "#f8fafc",
							},
						}}
					>
						<GroupRemove sx={{ fontSize: 16 }} />
						<Typography sx={{ fontSize: "12px", fontFamily: '"Noto Sans TC", sans-serif' }}>
							解散群組
						</Typography>
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

SelectSettings.propTypes = {
	canvas: PropTypes.object,
};

export default SelectSettings;
