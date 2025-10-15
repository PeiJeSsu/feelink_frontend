import React, { useState, useContext } from 'react';
import {
	Box,
	TextField,
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
	CircularProgress,
	Typography,
	FormControl,
	InputLabel
} from "@mui/material";
import {
	Add as AddIcon,
	Settings as SettingsIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	DeleteSweep as DeleteSweepIcon,
	Warning as WarningIcon,
} from "@mui/icons-material";
import { AuthContext } from "../../contexts/AuthContext";
import { showAlert } from "../../utils/AlertUtils";

const ChatroomManager = ({ 
	onSwitchChatroom, 
	onConfirmSwitchChatroom, 
	onClearChatroom,
	onClearCanvas, 
	chatDisabled 
}) => {
	const {
		userChatrooms,
		currentChatroomId,
		createNewChatroom,
		deleteChatroom: deleteChatroomFunc,
		updateChatroomTitle: updateChatroomTitleFunc,
	} = useContext(AuthContext);

	// 聊天室管理相關狀態
	const [openManageDialog, setOpenManageDialog] = useState(false);
	const [editingRoom, setEditingRoom] = useState(null);
	const [newTitle, setNewTitle] = useState('');
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [createTitle, setCreateTitle] = useState('');
	const [selectedAIPartner, setSelectedAIPartner] = useState(''); 

	// 刪除聊天室確認對話框相關狀態
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [deletingRoomId, setDeletingRoomId] = useState(null);
	const [deleting, setDeleting] = useState(false);

	// 切換聊天室確認對話框相關狀態
	const [openSwitchDialog, setOpenSwitchDialog] = useState(false);
	const [pendingSwitchRoomId, setPendingSwitchRoomId] = useState(null);

	// AI 夥伴選項列表
	const aiPartnerOptions = [
		{ value: 'MUSE', chineseName: '謬思', englishName: 'Muse' },
		{ value: 'QIQI', chineseName: '奇奇', englishName: 'QiQi' },
		{ value: 'NUANNUAN', chineseName: '暖暖', englishName: 'NuanNuan' }
	];

	// 獲取預設 AI 夥伴的 value (用於後端)
	const getDefaultAIPartnerValue = () => {
		const aiPartnerName = localStorage.getItem('aiPartnerName');
		
		// 根據中文名稱找到對應的 value
		const partner = aiPartnerOptions.find(
			option => option.chineseName === aiPartnerName
		);
		
		return partner ? partner.value : 'MUSE'; // 預設為 MUSE
	};

	// 開啟創建對話框時，初始化選擇的 AI 夥伴為使用者預設值
	const handleOpenCreateDialog = () => {
		const defaultPartnerValue = getDefaultAIPartnerValue();
		setSelectedAIPartner(defaultPartnerValue);
		setOpenCreateDialog(true);
	};

	// 關閉創建對話框並重置狀態
	const handleCloseCreateDialog = () => {
		setOpenCreateDialog(false);
		setCreateTitle('');
		setSelectedAIPartner('');
	};

	// 處理聊天室切換 - 先檢查是否需要彈出確認視窗
	const handleChatroomSelectChange = (selectedRoomId) => {
		// 如果選擇的是當前聊天室，不做任何操作
		if (selectedRoomId === currentChatroomId) {
			return;
		}

		if (onSwitchChatroom) {
			onSwitchChatroom(selectedRoomId, setPendingSwitchRoomId, setOpenSwitchDialog);
		}
	};

	// 確認切換聊天室 - 修正邏輯，這裡才清空畫布並切換
	const handleConfirmSwitchChatroom = () => {
		if (pendingSwitchRoomId && onConfirmSwitchChatroom) {
			onConfirmSwitchChatroom(pendingSwitchRoomId, () => {
				setPendingSwitchRoomId(null);
				setOpenSwitchDialog(false);
				showAlert('已切換聊天室並清空畫布', 'success');
			});
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

		if (!selectedAIPartner) {
			showAlert('請選擇 AI 夥伴', 'warning');
			return;
		}

		try {
			// 將選擇的 AI 夥伴一起傳給 createNewChatroom
			await createNewChatroom(createTitle, selectedAIPartner);
			setCreateTitle('');
			setSelectedAIPartner('');
			setOpenCreateDialog(false);
			showAlert('聊天室創建成功', 'success');
		} catch (error) {
			console.error('創建聊天室失敗:', error);
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

		// 檢查是否要刪除當前聊天室
		const isDeletingCurrentRoom = deletingRoomId === currentChatroomId;

		setDeleting(true);
		try {
			await deleteChatroomFunc(deletingRoomId);
			
			// 如果刪除的是當前聊天室，則清除畫布
			if (isDeletingCurrentRoom && onClearCanvas) {
				onClearCanvas();
			}
			
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

	// 獲取目標聊天室的標題
	const getTargetRoomTitle = () => {
		if (!pendingSwitchRoomId) return '';
		const targetRoom = userChatrooms?.find(room => room.chatroomId === pendingSwitchRoomId);
		return targetRoom ? targetRoom.title : '';
	};

	return (
		<>
			{/* 聊天室管理控制項 */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{/* 聊天室選擇下拉選單 */}
				<Select
					value={currentChatroomId || ''}
					onChange={(e) => handleChatroomSelectChange(e.target.value)}
					disabled={chatDisabled} 
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
							'&.Mui-disabled': {
								backgroundColor: '#f3f4f6',
								'& fieldset': {
									borderColor: '#d1d5db',
								},
								'& .MuiSelect-select': {
									color: '#9ca3af',
								}
							}
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
					onClick={handleOpenCreateDialog}
					disabled={chatDisabled} 
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
						},
						"&:disabled": {
							backgroundColor: "#f3f4f6",
							color: "#9ca3af",
							border: "1px solid #d1d5db",
						},
					}}
				>
					<AddIcon sx={{ fontSize: 18 }} />
				</IconButton>

				{/* 清空聊天室按鈕 */}
				<IconButton
					size="small"
					onClick={onClearChatroom}
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
							color: "#2563eb",
							borderColor: "#2563eb",
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

				{/* 管理聊天室按鈕 */}
				<IconButton
					size="small"
					onClick={() => setOpenManageDialog(true)}
					disabled={chatDisabled}
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
						},
						"&:disabled": {
							backgroundColor: "#f3f4f6",
							color: "#9ca3af",
							border: "1px solid #d1d5db",
						},
					}}
				>
					<SettingsIcon sx={{ fontSize: 18 }} />
				</IconButton>
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
						 <br />
						<small style={{ color: '#6b7280', fontSize: '12px' }}>
							提醒：如需保留畫布內容，請先使用存檔功能
						</small>
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

			{/* 創建聊天室對話框 - 加上右上角顯示預設夥伴和 AI 夥伴選擇 */}
			<Dialog
				open={openCreateDialog}
				onClose={handleCloseCreateDialog}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography variant="h6" component="span">
							創建新聊天室
						</Typography>
					</Box>
				</DialogTitle>
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
							if (e.key === 'Enter' && selectedAIPartner) {
								handleCreateChatroom();
							}
						}}
						sx={{ mb: 2 }}
					/>
					
					<FormControl fullWidth variant="outlined">
						<InputLabel id="ai-partner-select-label">選擇 AI 夥伴</InputLabel>
						<Select
							labelId="ai-partner-select-label"
							value={selectedAIPartner}
							onChange={(e) => setSelectedAIPartner(e.target.value)}
							label="選擇 AI 夥伴"
							sx={{
								'& .MuiSelect-select': {
									fontSize: '15px',
									fontFamily: '"Inter", "Noto Sans TC", sans-serif',
								}
							}}
						>
							{aiPartnerOptions.map(option => (
								<MenuItem key={option.value} value={option.value}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography>
											{option.chineseName} ({option.englishName})
										</Typography>
									</Box>
								</MenuItem>
							))}
						</Select>
					</FormControl>
					
					<Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6b7280' }}>
						此聊天室將使用選擇的 AI 夥伴進行對話
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCreateDialog} color="inherit">
						取消
					</Button>
					<Button
						onClick={handleCreateChatroom}
						variant="contained"
						startIcon={<AddIcon />}
						disabled={!createTitle.trim() || !selectedAIPartner}
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
						<p>確定要刪除這個聊天室嗎？此操作將永久刪除聊天室及其所有訊息，無法復原。</p>
						{deletingRoomId === currentChatroomId && (
							<p>
								<small style={{ color: '#6b7280', fontSize: '12px' }}>
									注意：刪除當前聊天室也會清空畫布內容，如需保留畫布內容，請先使用存檔功能
								</small>
							</p>
						)}
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
		</>
	);
};

export default ChatroomManager;