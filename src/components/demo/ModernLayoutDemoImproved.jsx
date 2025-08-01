import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Divider,
  TextField,
  Button,
  Tooltip,
  Paper,
  Avatar,
  Badge,
  Chip,
  Stack,
} from "@mui/material";
import {
  Brush,
  AutoFixHigh,
  FormatShapes,
  PanTool,
  FormatPaint,
  Title,
  AdsClick,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  DownloadOutlined,
  FileOpenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  SendOutlined,
  PaletteOutlined,
  GridOnOutlined,
  DeleteOutlineOutlined,
  ContentCopyOutlined,
  ContentPasteOutlined,
  ContentCutOutlined,
  CallSplitOutlined,
  GroupWorkOutlined,
  AssistantOutlined,
  NotificationsOutlined,
  ShareOutlined,
  AutoAwesomeOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import UserProfileMenu from "../auth/UserProfileMenu";

// 改進的現代化樣式範本頁面
const ModernLayoutDemoImproved = () => {
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [brushSize, setBrushSize] = useState(5);
  const [zoom, setZoom] = useState(100);
  const [message, setMessage] = useState("");
  const [hasSelectedObject] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#2563eb");

  // 工具列表（對應原本的 LeftToolbarButtons）
  const tools = [
    { id: "select", icon: AdsClick, label: "選擇工具" },
    { id: "pencil", icon: Brush, label: "畫筆工具" },
    { id: "shape", icon: FormatShapes, label: "圖形工具" },
    { id: "paintBucket", icon: FormatPaint, label: "填充工具" },
    { id: "eraser", icon: AutoFixHigh, label: "橡皮擦工具" },
    { id: "text", icon: Title, label: "文字工具" },
    { id: "pan", icon: PanTool, label: "移動畫布工具" },
  ];

  // 預設顏色調色盤
  const colorPalette = [
    "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
    "#64748b", "#f1f5f9", "#fca5a5", "#fdba74", "#fde047",
    "#86efac", "#67e8f9", "#93c5fd", "#c4b5fd", "#f9a8d4"
  ];

  // 假的 AI 聊天訊息
  const chatMessages = [
    { 
      id: 1, 
      message: "您好！我是 AI 助手，可以幫您分析畫布內容或協助創作。有什麼需要協助的嗎？", 
      isUser: false, 
      time: "14:30",
      avatar: "🤖"
    },
    { 
      id: 2, 
      message: "請幫我分析這個畫布", 
      isUser: true, 
      time: "14:32" 
    },
    { 
      id: 3, 
      message: "我看到您的畫布上有一些基本的線條和形狀。建議可以：\n1. 添加一些色彩來豐富作品\n2. 嘗試使用不同的筆刷大小\n3. 考慮添加文字說明", 
      isUser: false, 
      time: "14:33",
      avatar: "🎨"
    },
  ];

  const handleToolClick = (toolId) => {
    setSelectedTool(toolId);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  return (
    <Box sx={{ height: "100vh", backgroundColor: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      {/* 改進的頂部導航欄 */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #d1d5db",
          paddingX: 3,
          paddingY: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        {/* 左側：Logo 和主要功能 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* Logo */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              fontFamily: '"Inter", "Noto Sans TC", sans-serif',
            }}
          >
            FeelInk
          </Typography>

          {/* 主要功能按鈕組 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Tooltip title="復原" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <UndoOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="重做" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <RedoOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 檔案操作 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="開啟檔案" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <FileOpenOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="儲存" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <SaveOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="匯出" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <DownloadOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ height: 24, mx: 1 }} />
            
            <Tooltip title="剪下" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <ContentCutOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="複製" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <ContentCopyOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="貼上" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <ContentPasteOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ height: 24, mx: 1 }} />
            
            <Tooltip title="群組" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <GroupWorkOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="取消群組" placement="bottom">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <CallSplitOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 中央：畫布名稱 */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="未命名畫布"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "16px",
                fontWeight: 500,
                textAlign: "center",
                borderRadius: "8px",
                backgroundColor: "transparent",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "1px solid #e2e8f0",
                },
                "&.Mui-focused fieldset": {
                  border: "1px solid #2563eb",
                },
                "& input": {
                  textAlign: "center",
                  color: "#1e293b",
                  fontFamily: '"Inter", "Noto Sans TC", sans-serif',
                },
              },
            }}
          />
        </Box>

        {/* 右側：用戶功能 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="通知" placement="bottom">
            <IconButton 
              size="small" 
              sx={{ 
                width: 36, 
                height: 36, 
                color: "#475569" 
              }}
            >
              <Badge badgeContent={2} color="error" variant="dot">
                <NotificationsOutlined sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="分享" placement="bottom">
            <IconButton 
              size="small" 
              sx={{ 
                width: 36, 
                height: 36, 
                color: "#475569" 
              }}
            >
              <ShareOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* 使用者頭像區域 */}
          <UserProfileMenu />
        </Box>
      </Box>

      {/* 主要內容區域 */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 左側工具欄 */}
        <Paper
          sx={{
            width: 72,
            backgroundColor: "#ffffff",
            borderRight: "1px solid #d1d5db",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingY: 3,
            gap: 1.5,
            boxShadow: "none",
          }}
        >
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isSelected = selectedTool === tool.id;
            return (
              <Tooltip key={tool.id} title={tool.label} placement="right" arrow>
                <IconButton
                  onClick={() => handleToolClick(tool.id)}
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
                  {selectedTool === tool.id && (
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
                  {selectedTool !== tool.id && <IconComponent sx={{ fontSize: 20 }} />}
                </IconButton>
              </Tooltip>
            );
          })}
        </Paper>

        {/* 工具屬性面板 */}
        <Paper
          sx={{
            width: 280,
            backgroundColor: "#ffffff",
            borderRight: "1px solid #d1d5db",
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
          }}
        >
          {/* 屬性面板標題 */}
          <Box sx={{ padding: 3, borderBottom: "1px solid #e5e7eb" }}>
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "16px",
                fontFamily: '"Inter", "Noto Sans TC", sans-serif',
              }}
            >
              工具屬性
            </Typography>
          </Box>

          {/* 工具設定區域 */}
          <Box sx={{ flex: 1, padding: 3 }}>
            {/* 顏色選擇 */}
            <Box sx={{ marginBottom: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#374151",
                  fontWeight: 600,
                  marginBottom: 2,
                  fontSize: "14px",
                }}
              >
                顏色
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 1,
                  marginBottom: 2,
                }}
              >
                {colorPalette.map((color) => (
                  <Box
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      borderRadius: "6px",
                      border: selectedColor === color ? "3px solid #2563eb" : "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: 1.5,
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <PaletteOutlined sx={{ fontSize: 18, color: "#64748b" }} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  選中顏色: {selectedColor}
                </Typography>
              </Box>
            </Box>

            {/* 筆刷大小 */}
            {(selectedTool === "pencil" || selectedTool === "eraser") && (
              <Box sx={{ marginBottom: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 600,
                    marginBottom: 2,
                    fontSize: "14px",
                  }}
                >
                  {selectedTool === "pencil" ? "筆刷大小" : "橡皮擦大小"}
                </Typography>
                <Box sx={{ paddingX: 1 }}>
                  <Slider
                    value={brushSize}
                    onChange={(e, value) => setBrushSize(value)}
                    min={1}
                    max={50}
                    valueLabelDisplay="auto"
                    sx={{
                      color: "#2563eb",
                      height: 6,
                      "& .MuiSlider-thumb": {
                        height: 20,
                        width: 20,
                        backgroundColor: "#ffffff",
                        border: "3px solid #2563eb",
                        "&:hover": {
                          boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.16)",
                        },
                      },
                      "& .MuiSlider-track": {
                        border: "none",
                        height: 6,
                      },
                      "& .MuiSlider-rail": {
                        backgroundColor: "#e2e8f0",
                        height: 6,
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: "#64748b", 
                    textAlign: "center", 
                    marginTop: 1,
                    fontSize: "12px" 
                  }}
                >
                  大小: {brushSize}px
                </Typography>
              </Box>
            )}

            {/* 選中物件操作 */}
            {hasSelectedObject && (
              <Box sx={{ marginBottom: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 600,
                    marginBottom: 2,
                    fontSize: "14px",
                  }}
                >
                  物件操作
                </Typography>
                <Stack spacing={1}>
                  <Button
                    startIcon={<ContentCopyOutlined />}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "#e2e8f0",
                      color: "#374151",
                      "&:hover": {
                        borderColor: "#2563eb",
                        backgroundColor: "#f1f5f9",
                      },
                    }}
                  >
                    複製
                  </Button>
                  <Button
                    startIcon={<DeleteOutlineOutlined />}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "#e2e8f0",
                      color: "#dc2626",
                      "&:hover": {
                        borderColor: "#dc2626",
                        backgroundColor: "#fef2f2",
                      },
                    }}
                  >
                    刪除
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 畫布區域 */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* 畫布容器 */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 模擬畫布 */}
            <Paper
              sx={{
                width: "80%",
                height: "80%",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e5e7eb",
                position: "relative",
              }}
            >
              {/* 畫布網格背景 */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
              
              {/* 畫布內容提示 */}
              <Box sx={{ textAlign: "center", zIndex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 500,
                    marginBottom: 1,
                    fontFamily: '"Inter", "Noto Sans TC", sans-serif',
                  }}
                >
                  畫布區域
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#cbd5e1",
                    fontSize: "14px",
                  }}
                >
                  選擇左側工具開始創作
                </Typography>
              </Box>
            </Paper>
          </Box>
          
          {/* 畫布底部控制欄 */}
          <Box
            sx={{
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e5e7eb",
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {/* 縮放控制 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: 1,
                border: "1px solid #e2e8f0",
              }}
            >
              <Tooltip title="縮小" placement="top">
                <IconButton 
                  size="small" 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    color: "#475569" 
                  }}
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                >
                  <ZoomOutOutlined sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Typography
                variant="body2"
                sx={{
                  minWidth: "50px",
                  textAlign: "center",
                  color: "#374151",
                  fontWeight: 500,
                  fontSize: "13px",
                }}
              >
                {zoom}%
              </Typography>
              <Tooltip title="放大" placement="top">
                <IconButton 
                  size="small" 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    color: "#475569" 
                  }}
                  onClick={() => setZoom(Math.min(400, zoom + 25))}
                >
                  <ZoomInOutlined sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Tooltip title="重置視角" placement="top">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <RotateLeftOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="網格顯示" placement="top">
              <IconButton 
                size="small" 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  color: "#475569",
                  "&:hover": { backgroundColor: "#f1f5f9", color: "#2563eb" }
                }}
              >
                <GridOnOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* AI 聊天面板 */}
        <Paper
          sx={{
            width: 320,
            backgroundColor: "#ffffff",
            borderLeft: "1px solid #d1d5db",
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
          }}
        >
          {/* 聊天標題 */}
          <Box 
            sx={{ 
              padding: 3, 
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AssistantOutlined sx={{ color: "#2563eb", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "16px",
                  fontFamily: '"Inter", "Noto Sans TC", sans-serif',
                }}
              >
                AI 助手
              </Typography>
            </Box>
            <Chip 
              label="Beta" 
              size="small" 
              sx={{ 
                backgroundColor: "#dbeafe", 
                color: "#1d4ed8",
                fontSize: "11px",
                fontWeight: 600
              }} 
            />
          </Box>

          {/* 聊天訊息區域 */}
          <Box sx={{ flex: 1, overflowY: "auto", padding: 2 }}>
            <Stack spacing={2}>
              {chatMessages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    ...(msg.isUser && { flexDirection: "row-reverse" }),
                  }}
                >
                  {!msg.isUser && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: "#f1f5f9",
                        fontSize: "16px",
                      }}
                    >
                      {msg.avatar}
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: "75%",
                      ...(msg.isUser && { textAlign: "right" }),
                    }}
                  >
                    <Paper
                      sx={{
                        padding: 2,
                        backgroundColor: msg.isUser ? "#2563eb" : "#f8fafc",
                        color: msg.isUser ? "#ffffff" : "#374151",
                        borderRadius: msg.isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        border: msg.isUser ? "none" : "1px solid #e5e7eb",
                        boxShadow: "none",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          lineHeight: 1.5,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {msg.message}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#9ca3af",
                        marginTop: 0.5,
                        display: "block",
                        fontSize: "11px",
                      }}
                    >
                      {msg.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* 聊天輸入區域 */}
          <Box sx={{ padding: 2, borderTop: "1px solid #e5e7eb" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="與 AI 助手對話..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    fontSize: "14px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2563eb",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563eb",
                    },
                  },
                }}
              />
              <IconButton
                sx={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                }}
                onClick={() => {
                  if (message.trim()) {
                    // 這裡可以加入發送訊息的邏輯
                    setMessage("");
                  }
                }}
              >
                <SendOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            
            {/* 快速操作按鈕 */}
            <Box sx={{ display: "flex", gap: 1, marginTop: 1.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AutoAwesomeOutlined />}
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  fontSize: "12px",
                  borderRadius: "20px",
                  "&:hover": {
                    borderColor: "#2563eb",
                    backgroundColor: "#f1f5f9",
                  },
                }}
              >
                分析畫布
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ImageOutlined />}
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  fontSize: "12px",
                  borderRadius: "20px",
                  "&:hover": {
                    borderColor: "#2563eb",
                    backgroundColor: "#f1f5f9",
                  },
                }}
              >
                生成圖象
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ModernLayoutDemoImproved;
