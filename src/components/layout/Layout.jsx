import { useState, useCallback, useRef, useEffect, useContext } from "react";
import { 
	Box, 
	TextField, 
	Typography, 
	Button, 
	Select, 
	MenuItem, 
	IconButton, 
	Dialog, 
	DialogActions, 
	DialogContent, 
	DialogContentText, 
	DialogTitle, 
	List, 
	ListItem, 
	ListItemText,
	CircularProgress 
} from "@mui/material";
import { 
	Help, 
	Add as AddIcon, 
	Settings as SettingsIcon, 
	Edit as EditIcon, 
	Delete as DeleteIcon,
	DeleteSweep as DeleteSweepIcon,
	Warning as WarningIcon
} from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import LeftToolbar from "../toolbar/left-toolbar/LeftToolbar";
import TopToolbar from "../toolbar/top-toolbar/TopToolbar";
import Canvas from "../canvas/Canvas";
import ChatRoom from "../../ChatRoom/components/ChatRoom";
import UserProfileMenu from "../auth/UserProfileMenu";
import AppTour from "./AppTour";
import { AuthContext } from "../../contexts/AuthContext";
import { showAlert } from "../../utils/AlertUtils";
import { layoutStyles } from "../../styles/layoutStyles";
import "./Layout.css";

const Layout = () => {
	const [activeTool, setActiveTool] = useState("select");
	const [isChatOpen, setIsChatOpen] = useState(true);
	const [chatWidth, setChatWidth] = useState(400);
	const [chatDisabled, setChatDisabled] = useState(false);
	const [brushSettings, setBrushSettings] = useState({
		type: "PencilBrush",
		size: 5,
		opacity: 1,
		color: "#000000",
	});

	const [shapeSettings, setShapeSettings] = useState({
		type: "RECT",
		color: "#000000",
		stroke: "#000000",
		strokeWidth: 2,
		fill: "transparent",
		opacity: 1,
		showStroke: true,
	});

	const [eraserSettings, setEraserSettings] = useState({
		size: 20,
		type: "path",
	});

	const [paintBucketSettings, setPaintBucketSettings] = useState({
		color: "#000000",
		tolerance: 2,
	});

	const [textSettings, setTextSettings] = useState({
		fontFamily: '"Noto Sans TC", sans-serif',
		fontSize: 24,
		fill: "#000000",
		fontWeight: "400",
	});

	const [clearTrigger, setClearTrigger] = useState(0);
	
	// 導覽相關狀態
	const [runTour, setRunTour] = useState(false);

	// AuthContext 中的聊天室管理功能
	const { 
		userChatrooms,
		currentChatroomId,
		createNewChatroom,
		deleteChatroom: deleteChatroomFunc,
		updateChatroomTitle: updateChatroomTitleFunc,
		switchChatroom
	} = useContext(AuthContext);

	// 聊天室管理相關狀態
	const [openManageDialog, setOpenManageDialog] = useState(false);
	const [editingRoom, setEditingRoom] = useState(null);
	const [newTitle, setNewTitle] = useState('');
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [createTitle, setCreateTitle] = useState('');
	
	// 刪除聊天室確認對話框相關狀態
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [deletingRoomId, setDeletingRoomId] = useState(null);
	const [deleting, setDeleting] = useState(false);

	// 切換聊天室確認對話框相關狀態
	const [openSwitchDialog, setOpenSwitchDialog] = useState(false);
	const [pendingSwitchRoomId, setPendingSwitchRoomId] = useState(null);

	const canvasRef = useRef(null);
	const chatRoomRef = useRef(null); // 新增 ChatRoom 的 ref

	const [canvasReady, setCanvasReady] = useState(false);

	useEffect(() => {
		if (!canvasReady || !canvasRef.current) return;
		const canvas = canvasRef.current;
		function handleSelection() {
			const activeObject = canvas.getActiveObject?.();
			if (activeObject && activeObject.type === "textbox") {
				setTextSettings({
					fontFamily: activeObject.fontFamily || '"Noto Sans TC", sans-serif',
					fontSize: activeObject.fontSize || 24,
					fill: activeObject.fill || "#000000",
					fontWeight: activeObject.fontWeight || "400",
				});
			}
		}
		canvas.on("selection:created", handleSelection);
		canvas.on("selection:updated", handleSelection);
		return () => {
			canvas.off("selection:created", handleSelection);
			canvas.off("selection:updated", handleSelection);
		};
	}, [canvasReady]);

	const handleClearCanvas = useCallback(() => {
		setClearTrigger((prev) => prev + 1);
	}, []);

	const setCanvasInstance = useCallback((canvas) => {
		canvasRef.current = canvas;
		setCanvasReady(true);
	}, []);

	const toggleChat = () => {
		setIsChatOpen(!isChatOpen);
	};

	const handleResizeStart = useCallback(() => {
		document.body.style.cursor = "col-resize";
		// 禁用頁面文字選取，防止拖曳時選到文字
		document.body.style.userSelect = "none";
		document.body.style.webkitUserSelect = "none";
		document.body.style.mozUserSelect = "none";
		document.body.style.msUserSelect = "none";
		// 添加拖曳狀態類別
		document.body.classList.add("resizing");
	}, []);

	const handleResizeStop = useCallback(() => {
		document.body.style.cursor = "";
		// 恢復頁面文字選取功能
		document.body.style.userSelect = "";
		document.body.style.webkitUserSelect = "";
		document.body.style.mozUserSelect = "";
		document.body.style.msUserSelect = "";
		// 移除拖曳狀態類別
		document.body.classList.remove("resizing");
	}, []);

	const handleResize = useCallback((e, { size }) => {
		// 立即更新寬度狀態，避免延遲
		setChatWidth(size.width);
	}, []);

	// 處理聊天室切換 - 先檢查是否需要彈出確認視窗
	const handleChatroomSelectChange = (selectedRoomId) => {
		// 如果選擇的是當前聊天室，不做任何操作
		if (selectedRoomId === currentChatroomId) {
			return;
		}

		// 檢查畫布是否有內容（這裡可以根據你的需求調整檢查邏輯）
		const hasCanvasContent = checkCanvasContent();
		
		if (hasCanvasContent) {
			// 如果有內容，彈出確認對話框
			setPendingSwitchRoomId(selectedRoomId);
			setOpenSwitchDialog(true);
		} else {
			// 如果沒有內容，直接切換
			switchChatroom(selectedRoomId);
		}
	};

	// 檢查畫布是否有內容的函式
	const checkCanvasContent = () => {
		if (!canvasRef.current) return false;
		
		const canvas = canvasRef.current;
		// 檢查畫布上是否有物件（除了背景）
		const objects = canvas.getObjects();
		return objects && objects.length > 0;
	};

	// 確認切換聊天室
	const handleConfirmSwitchChatroom = () => {
		if (pendingSwitchRoomId) {
			// 清空畫布
			handleClearCanvas();
			// 切換聊天室
			switchChatroom(pendingSwitchRoomId);
			// 重置狀態
			setPendingSwitchRoomId(null);
			setOpenSwitchDialog(false);
			showAlert('已切換聊天室並清空畫布', 'success');
		}
	};

	// 取消切換聊天室
	const handleCancelSwitchChatroom = () => {
		setPendingSwitchRoomId(null);
		setOpenSwitchDialog(false);
	};

	// 聊天室管理函數
	const handleCreateChatroom = async () => {
		if (!createTitle.trim()) {
			showAlert('請輸入聊天室標題', 'warning');
			return;
		}

		try {
			await createNewChatroom(createTitle);
			setCreateTitle('');
			setOpenCreateDialog(false);
			showAlert('聊天室創建成功', 'success');
		} catch (error) {
			showAlert('創建聊天室失敗', 'error');
		}
	};

	// 觸發刪除確認對話框
	const handleDeleteChatroomClick = (chatroomId) => {
		setDeletingRoomId(chatroomId);
		setOpenDeleteDialog(true);
	};

	// 執行刪除聊天室
	const handleDeleteChatroom = async () => {
		if (!deletingRoomId) return;
		
		if (userChatrooms.length <= 1) {
			showAlert('至少需要保留一個聊天室', 'warning');
			setOpenDeleteDialog(false);
			setDeletingRoomId(null);
			return;
		}

		setDeleting(true);
		try {
			await deleteChatroomFunc(deletingRoomId);
			showAlert('聊天室已刪除', 'success');
			setOpenDeleteDialog(false);
			setDeletingRoomId(null);
		} catch (error) {
			showAlert('刪除聊天室失敗', 'error');
		} finally {
			setDeleting(false);
		}
	};

	const handleUpdateTitle = async () => {
		if (!editingRoom || !newTitle.trim()) {
			showAlert('請輸入有效的標題', 'warning');
			return;
		}

		try {
			await updateChatroomTitleFunc(editingRoom.chatroomId, newTitle);
			setEditingRoom(null);
			setNewTitle('');
			showAlert('標題已更新', 'success');
		} catch (error) {
			showAlert('更新標題失敗', 'error');
		}
	};

	const startEditing = (room) => {
		setEditingRoom(room);
		setNewTitle(room.title);
	};

	const cancelEditing = () => {
		setEditingRoom(null);
		setNewTitle('');
	};

	// 處理清空聊天室按鈕點擊
	const handleClearChatroomClick = () => {
		if (chatRoomRef.current) {
			chatRoomRef.current.handleClearChatroom();
		}
	};

	// 獲取目標聊天室的標題
	const getTargetRoomTitle = () => {
		if (!pendingSwitchRoomId) return '';
		const targetRoom = userChatrooms?.find(room => room.chatroomId === pendingSwitchRoomId);
		return targetRoom ? targetRoom.title : '';
	};

	return (
		<Box sx={layoutStyles.layoutContainer}>
			{/* 現代化頂部導航欄 */}
			<Box sx={layoutStyles.topToolbarContainer} className="top-toolbar">
				{/* 左側：Logo 和主要功能 */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
					{/* Logo */}
					<Typography
						variant="h5"
						className="app-logo"
						sx={{
							fontWeight: 700,
							color: "#1e293b",
							fontFamily: '"Inter", "Noto Sans TC", sans-serif',
						}}
					>
						FeelInk
					</Typography>

					{/* 主要功能按鈕組 - TopToolbar */}
					<TopToolbar
						onClearClick={handleClearCanvas}
						canvas={canvasRef.current}
						chatWidth={0}
					/>
				</Box>

				{/* 中央：聊天室管理 */}
				<Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
					{/* 聊天室選擇下拉選單 */}
					<Select
						value={currentChatroomId || ''}
						onChange={(e) => handleChatroomSelectChange(e.target.value)}
						size="small"
						sx={{ 
							minWidth: 200,
							'& .MuiSelect-select': {
								fontSize: '16px',
								fontWeight: 500,
								padding: '8px 12px',
								fontFamily: '"Inter", "Noto Sans TC", sans-serif',
							},
							'& .MuiOutlinedInput-root': {
								borderRadius: '8px',
								'& fieldset': {
									borderColor: '#d1d5db',
								},
								'&:hover fieldset': {
									borderColor: '#2563eb',
								},
								'&.Mui-focused fieldset': {
									borderColor: '#2563eb',
								},
							}
						}}
						displayEmpty
					>
						{userChatrooms?.map(room => (
							<MenuItem key={room.chatroomId} value={room.chatroomId}>
								{room.title}
							</MenuItem>
						))}
					</Select>
					
					{/* 新增聊天室按鈕 */}
					<IconButton
						size="small"
						onClick={() => setOpenCreateDialog(true)}
						title="新增聊天室"
						sx={{ 
							color: "#64748b",
							backgroundColor: "#f8fafc",
							border: "1px solid #d1d5db",
							borderRadius: "8px",
							width: "36px",
							height: "36px",
							"&:hover": {
								backgroundColor: "#f1f5f9",
								color: "#2563eb",
								borderColor: "#2563eb",
							}
						}}
					>
						<AddIcon sx={{ fontSize: 18 }} />
					</IconButton>
					
					{/* 管理聊天室按鈕 */}
					<IconButton
						size="small"
						onClick={() => setOpenManageDialog(true)}
						title="管理聊天室"
						sx={{ 
							color: "#64748b",
							backgroundColor: "#f8fafc",
							border: "1px solid #d1d5db",
							borderRadius: "8px",
							width: "36px",
							height: "36px",
							"&:hover": {
								backgroundColor: "#f1f5f9",
								color: "#2563eb",
								borderColor: "#2563eb",
							}
						}}
					>
						<SettingsIcon sx={{ fontSize: 18 }} />
					</IconButton>

					{/* 清空聊天室按鈕 */}
					<IconButton
						size="small"
						onClick={handleClearChatroomClick}
						disabled={chatDisabled}
						title="清空聊天室"
						sx={{ 
							color: "#64748b",
							backgroundColor: "#f8fafc",
							border: "1px solid #d1d5db",
							borderRadius: "8px",
							width: "36px",
							height: "36px",
							"&:hover": {
								backgroundColor: "#f1f5f9",
								color: "#dc2626",
								borderColor: "#dc2626",
							},
							"&:disabled": { 
								backgroundColor: "#f3f4f6",
								color: "#9ca3af",
								border: "1px solid #d1d5db",
							},
						}}
					>
						<DeleteSweepIcon sx={{ fontSize: 18 }} />
					</IconButton>
				</Box>

				{/* 右側：使用者功能 */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					{/* 聊天室切換按鈕 */}
					<Button
						onClick={toggleChat}
						disabled={chatDisabled}
						variant={isChatOpen ? "text" : "outlined"}
						className="chat-toggle"
						sx={{
							color: isChatOpen ? "#2563eb" : "#64748b",
							backgroundColor: isChatOpen ? "#f1f5f9" : "transparent",
							border: isChatOpen ? "1px solid #2563eb" : "1px solid #d1d5db",
							fontSize: "14px",
							fontWeight: isChatOpen ? 500 : 600,
							padding: "6px 12px",
							borderRadius: "8px",
							textTransform: "none",
							fontFamily: '"Inter", "Noto Sans TC", sans-serif',
							height: "36px",
							"&:hover": {
								backgroundColor: isChatOpen ? "#f1f5f9" : "#f9fafb",
								color: "#2563eb",
								border: isChatOpen ? "none" : "1px solid #2563eb",
							},
							"&:disabled": { 
								backgroundColor: "#f3f4f6",
								color: "#9ca3af",
								border: "1px solid #d1d5db",
							},
						}}
					>
						{isChatOpen ? "關閉聊天室" : "開啟聊天室"}
					</Button>
					
					{/* 導覽按鈕 */}
					<Button
						onClick={() => setRunTour(true)}
						variant="contained"
						startIcon={<Help sx={{ fontSize: 16 }} />}
						sx={{
							color: "#ffffff",
							backgroundColor: "#1e40af",
							border: "none",
							fontSize: "14px",
							fontWeight: 600,
							padding: "6px 12px",
							borderRadius: "8px",
							textTransform: "none",
							fontFamily: '"Inter", "Noto Sans TC", sans-serif',
							minWidth: "auto",
							height: "36px",
							"&:hover": {
								backgroundColor: "#1d4ed8",
							},
						}}
					>
						導覽
					</Button>
					
					<Box className="user-profile">
						<UserProfileMenu />
					</Box>
				</Box>
			</Box>

			{/* 主要內容區域 */}
			<Box sx={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
				{/* 左側工具欄 */}
				<Box className="left-toolbar">
					<LeftToolbar
						setActiveTool={setActiveTool}
						activeTool={activeTool}
						setBrushSettings={setBrushSettings}
						brushSettings={brushSettings}
						setShapeSettings={setShapeSettings}
						shapeSettings={shapeSettings}
						setEraserSettings={setEraserSettings}
						eraserSettings={eraserSettings}
						setPaintBucketSettings={setPaintBucketSettings}
						paintBucketSettings={paintBucketSettings}
						setTextSettings={setTextSettings}
						textSettings={textSettings}
						onClearCanvas={handleClearCanvas}
						canvas={canvasRef.current}
					/>
				</Box>

				{/* 畫布區域 */}
				<Box className="canvas-area" sx={{ 
					flex: 1, 
					display: "flex", 
					flexDirection: "column",
					background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
					padding: "20px",
					paddingBottom: "20px",
					minWidth: 0,
					transition: "all 0.3s ease-in-out",
				}}>
					<Box sx={{
						flex: 1,
						backgroundColor: "#ffffff",
						borderRadius: "12px",
						border: "1px solid #aeb8d5f5",
						overflow: "hidden",
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
					}}>
						<Canvas
							activeTool={activeTool}
							brushSettings={brushSettings}
							shapeSettings={shapeSettings}
							eraserSettings={eraserSettings}
							paintBucketSettings={paintBucketSettings}
							textSettings={textSettings}
							clearTrigger={clearTrigger}
							onCanvasInit={setCanvasInstance}
							chatWidth={chatWidth}
							isChatOpen={isChatOpen}
						/>
					</Box>
				</Box>

				{/* 聊天面板 */}
				{isChatOpen && (
					<ResizableBox
						className="chat-container"
						width={chatWidth}
						height={Infinity}
						minConstraints={[380, Infinity]}
						maxConstraints={[550, Infinity]}
						axis="x"
						resizeHandles={["w"]}
						onResize={handleResize}
						onResizeStart={handleResizeStart}
						onResizeStop={handleResizeStop}
						style={{
							flexShrink: 0,
							height: "100%",
						}}
						draggableOpts={{
							enableUserSelectHack: false,
							// 防止拖曳時的預設行為
							onStart: (e) => {
								e.preventDefault();
								return true;
							},
							onDrag: (e) => {
								e.preventDefault();
								return true;
							},
							onStop: (e) => {
								e.preventDefault();
								return true;
							}
						}}
					>
						<ChatRoom 
							ref={chatRoomRef} 
							canvas={canvasRef.current} 
							onClose={toggleChat} 
							onDisabledChange={setChatDisabled}
						/>
					</ResizableBox>
				)}
			</Box>
			
			{/* 切換聊天室確認對話框 */}
			<Dialog
				open={openSwitchDialog}
				onClose={handleCancelSwitchChatroom}
				aria-labelledby="switch-dialog-title"
				aria-describedby="switch-dialog-description"
			>
				<DialogTitle id="switch-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<WarningIcon color="warning" />
					切換聊天室確認
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="switch-dialog-description">
						切換到「{getTargetRoomTitle()}」聊天室將會清空目前的畫布內容。
						<br />
						確定要繼續嗎？
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button 
						onClick={handleCancelSwitchChatroom} 
						color="inherit"
					>
						取消
					</Button>
					<Button 
						onClick={handleConfirmSwitchChatroom} 
						color="warning"
						variant="contained"
						startIcon={<WarningIcon />}
					>
						確認切換
					</Button>
				</DialogActions>
			</Dialog>
			
			{/* 創建聊天室對話框 */}
			<Dialog
				open={openCreateDialog}
				onClose={() => setOpenCreateDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>創建新聊天室</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="聊天室標題"
						fullWidth
						variant="outlined"
						value={createTitle}
						onChange={(e) => setCreateTitle(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === 'Enter') {
								handleCreateChatroom();
							}
						}}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenCreateDialog(false)} color="inherit">
						取消
					</Button>
					<Button 
						onClick={handleCreateChatroom} 
						variant="contained"
						startIcon={<AddIcon />}
					>
						創建
					</Button>
				</DialogActions>
			</Dialog>

			{/* 管理聊天室對話框 */}
			<Dialog
				open={openManageDialog}
				onClose={() => setOpenManageDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>管理聊天室</DialogTitle>
				<DialogContent>
					<List>
						{userChatrooms?.map(room => (
							<ListItem key={room.chatroomId} divider>
								{editingRoom?.chatroomId === room.chatroomId ? (
									// 編輯模式
									<Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
										<TextField
											value={newTitle}
											onChange={(e) => setNewTitle(e.target.value)}
											size="small"
											sx={{ flexGrow: 1, marginRight: 1 }}
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													handleUpdateTitle();
												}
											}}
										/>
										<IconButton 
											onClick={handleUpdateTitle}
											size="small"
											color="primary"
										>
											✓
										</IconButton>
										<IconButton 
											onClick={cancelEditing}
											size="small"
										>
											✗
										</IconButton>
									</Box>
								) : (
									// 顯示模式
									<>
										<ListItemText 
											primary={room.title}
											secondary={room.chatroomId === currentChatroomId ? '當前聊天室' : ''}
										/>
										<IconButton 
											onClick={() => startEditing(room)}
											size="small"
											title="編輯標題"
										>
											<EditIcon />
										</IconButton>
										<IconButton 
											onClick={() => handleDeleteChatroomClick(room.chatroomId)}
											size="small"
											disabled={userChatrooms.length === 1}
											title={userChatrooms.length === 1 ? "至少需要保留一個聊天室" : "刪除聊天室"}
											color="error"
										>
											<DeleteIcon />
										</IconButton>
									</>
								)}
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenManageDialog(false)}>
						關閉
					</Button>
				</DialogActions>
			</Dialog>

			{/* 刪除聊天室確認對話框 */}
			<Dialog
				open={openDeleteDialog}
				onClose={() => !deleting && setOpenDeleteDialog(false)}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">
					刪除聊天室
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						確定要刪除這個聊天室嗎？此操作將永久刪除聊天室及其所有訊息，無法復原。
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button 
						onClick={() => setOpenDeleteDialog(false)} 
						disabled={deleting}
						color="inherit"
					>
						取消
					</Button>
					<Button 
						onClick={handleDeleteChatroom} 
						disabled={deleting}
						color="error"
						variant="contained"
						startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
					>
						{deleting ? '刪除中...' : '確認刪除'}
					</Button>
				</DialogActions>
			</Dialog>
			
			{/* 導覽組件 */}
			<AppTour runTour={runTour} setRunTour={setRunTour} />
		</Box>
	);
};

export default Layout;