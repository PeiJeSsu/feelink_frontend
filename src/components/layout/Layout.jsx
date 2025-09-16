import { useState, useCallback, useRef, useEffect, useContext } from "react";
import { 
	Box, 
	Typography, 
	Button,
} from "@mui/material";
import { 
	Help
} from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import LeftToolbar from "../toolbar/left-toolbar/LeftToolbar";
import TopToolbar from "../toolbar/top-toolbar/TopToolbar";
import Canvas from "../canvas/Canvas";
import ChatRoom from "../../ChatRoom/components/ChatRoom";
import UserProfileMenu from "../auth/UserProfileMenu";
import AppTour from "./AppTour";
import ChatroomManager from "../ChatRoomManager/ChatroomManager";
import { AuthContext } from "../../contexts/AuthContext";
import { layoutStyles } from "../../styles/layoutStyles";
import "./Layout.css";

const Layout = () => {
	// 將 AuthContext 移到組件頂層
	const { switchChatroom } = useContext(AuthContext);

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

	// 檢查畫布是否有內容的函式 - 用 useCallback 包裝
	const checkCanvasContent = useCallback(() => {
		if (!canvasRef.current) return false;
		
		const canvas = canvasRef.current;
		// 檢查畫布上是否有物件（除了背景）
		const objects = canvas.getObjects();
		return objects && objects.length > 0;
	}, []);

	// 處理聊天室切換 - 修正邏輯，不要在這裡清空畫布
	const handleSwitchChatroom = useCallback((selectedRoomId, setPendingSwitchRoomId, setOpenSwitchDialog) => {
		// 檢查畫布是否有內容
		const hasCanvasContent = checkCanvasContent();
		
		if (hasCanvasContent) {
			// 如果有內容，彈出確認對話框，但不清空畫布
			setPendingSwitchRoomId(selectedRoomId);
			setOpenSwitchDialog(true);
		} else {
			// 如果沒有內容，直接切換
			switchChatroom(selectedRoomId);
		}
	}, [switchChatroom, checkCanvasContent]); // 移除 handleClearCanvas 依賴

	// 新增：處理確認切換聊天室的函式，這裡才清空畫布
	const handleConfirmSwitchChatroom = useCallback((selectedRoomId, onSuccess) => {
		// 先清空畫布
		handleClearCanvas();
		// 然後切換聊天室
		switchChatroom(selectedRoomId);
		// 執行成功回調
		if (onSuccess) {
			onSuccess();
		}
	}, [handleClearCanvas, switchChatroom]);

	// 處理清空聊天室按鈕點擊
	const handleClearChatroomClick = () => {
		if (chatRoomRef.current) {
			chatRoomRef.current.handleClearChatroom();
		}
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
				<Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
					<ChatroomManager 
						onSwitchChatroom={handleSwitchChatroom}
						onConfirmSwitchChatroom={handleConfirmSwitchChatroom}
						onClearChatroom={handleClearChatroomClick}
						onClearCanvas={handleClearCanvas}
						chatDisabled={chatDisabled}
					/>
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
			
			{/* 導覽組件 */}
			<AppTour runTour={runTour} setRunTour={setRunTour} />
		</Box>
	);
};

export default Layout;