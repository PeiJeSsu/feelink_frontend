import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    Tooltip,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History"; // 編輯歷史
import ContentCutIcon from "@mui/icons-material/ContentCut"; // 剪貼功能
import FolderIcon from "@mui/icons-material/Folder"; // 檔案操作
import ImageIcon from "@mui/icons-material/Image"; // 圖片操作
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep"; // 清除功能

const getGroupIcon = (label) => {
    switch (label) {
        case "編輯操作":
            return <HistoryIcon />;
        case "剪貼功能":
            return <ContentCutIcon />;
        case "檔案操作":
            return <FolderIcon />;
        case "圖片操作":
            return <ImageIcon />;
        case "其他功能":
            return <DeleteSweepIcon />;
        default:
            return null;
    }
};

// 新增 Tooltip title 產生函式
const getTooltipTitle = (label) => {
    switch (label) {
        case "編輯操作":
            return "編輯操作";
        case "剪貼功能":
            return "剪貼功能";
        case "檔案操作":
            return "檔案操作";
        case "圖片操作":
            return "圖片操作";
        case "其他功能":
            return "其他功能";
        default:
            return label;
    }
};

const ToolbarButtonGroup = ({
    children,
    label,
    index = 0,
    totalGroups = 1,
    availableWidth = Infinity,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const buttonGroupRef = useRef(null);

    const shouldCollapse = React.useMemo(() => {
        // 如果是移動端，直接折疊
        if (isMobile) return true;

        // 計算當前按鈕組需要的空間
        const minWidthPerGroup = 120; // 完整按鈕組的最小寬度
        const collapsedWidth = 48; // 濃縮後的寬度
        const spacing = 8; // 按鈕組之間的間距

        // 計算從右到左到目前按鈕組需要的總空間
        const currentGroupPosition = (totalGroups - index) * (minWidthPerGroup + spacing);

        // 如果目前位置的空間不足，則需要折疊
        const collapsedButtonsSpace = index * (collapsedWidth + spacing);
        const availableSpaceForCurrentGroup = availableWidth - collapsedButtonsSpace;

        return availableSpaceForCurrentGroup < currentGroupPosition;
    }, [isMobile, index, totalGroups, availableWidth]);

    // 當按鈕組展開/折疊狀態改變時，強制重新計算佈局
    useEffect(() => {
        if (buttonGroupRef.current) {
            buttonGroupRef.current.style.display = 'none';
            buttonGroupRef.current.style.display = '';
        }
    }, [shouldCollapse]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <Box ref={buttonGroupRef}>
            {!shouldCollapse ? (
                <Box sx={{ 
                    display: "flex", 
                    alignItems: "center",
                    transition: "all 0.3s ease"
                }}>
                    {children}
                </Box>
            ) : (
                <>
                    <Tooltip title={getTooltipTitle(label)} placement="bottom">
                        <IconButton
                            aria-label={label}
                            onClick={handleClick}
                            size="small"
                            sx={{
                                bgcolor: anchorEl ? "action.selected" : "transparent",
                                "&:hover": {
                                    bgcolor: "action.hover",
                                },
                                transition: "all 0.3s ease"
                            }}
                        >
                            {getGroupIcon(label)}
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        onClick={handleClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                        }}
                        PaperProps={{
                            sx: {
                                bgcolor: "background.paper",
                                "& .MuiMenuItem-root": {
                                    px: 1,
                                    py: 0.5,
                                    minHeight: "auto",
                                    justifyContent: "center",
                                },
                                minWidth: "auto",
                            },
                        }}
                        TransitionProps={{
                            mountOnEnter: true,
                            unmountOnExit: true,
                            timeout: 300
                        }}
                    >
                        {React.Children.map(children, (child) => {
                            if (!child || child.type.name === "Divider") return null;
                            return (
                                <MenuItem>
                                    {React.cloneElement(child, {
                                        size: "small",
                                        sx: { p: 0.5 },
                                })}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </>
            )}
        </Box>
    );
};

ToolbarButtonGroup.propTypes = {
    children: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    index: PropTypes.number,
    totalGroups: PropTypes.number,
    availableWidth: PropTypes.number,
};

export default ToolbarButtonGroup;
