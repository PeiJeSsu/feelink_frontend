import { useState, useEffect } from "react";
import {
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Divider,
    ListItemIcon,
} from "@mui/material";
import { AccountCircle, Logout, Person } from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import {useHandleDirtyButtonClick} from "../SaveCanvas/useHandleDirtyButtonClick";

const UserProfileMenu = ({ isDirty = false }) => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [userNickname, setUserNickname] = useState("");
    const open = Boolean(anchorEl);
    const handleDirtyButtonClick = useHandleDirtyButtonClick(isDirty);

    // 監聽 localStorage 的變化，取得使用者設定的暱稱
    useEffect(() => {
        const getNickname = () => {
            const savedNickname = localStorage.getItem('userNickname');
            setUserNickname(savedNickname || "");
        };

        // 初始載入
        getNickname();

        // 監聽 storage 事件，當其他分頁更改 localStorage 時更新
        window.addEventListener('storage', getNickname);

        // 自定義事件監聽，當同一分頁內更改 localStorage 時更新
        const handleNicknameUpdate = () => getNickname();
        window.addEventListener('nicknameUpdated', handleNicknameUpdate);

        return () => {
            window.removeEventListener('storage', getNickname);
            window.removeEventListener('nicknameUpdated', handleNicknameUpdate);
        };
    }, []);

    // 取得顯示的暱稱，優先級：localStorage 暱稱 > Firebase displayName > "使用者"
    const getDisplayName = () => {
        if (userNickname) return userNickname;
        if (user?.displayName) return user.displayName;
        return "使用者";
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        // 使用 handleDirtyButtonClick 來處理登出
        handleDirtyButtonClick(async () => {
            try {
                await logout();
                handleClose();
            } catch (error) {
                console.error("登出失敗:", error);
            }
        });
    };

    const handleProfileClick = () => {
        handleClose();
        handleDirtyButtonClick("/personality");
    };


    return (
        <Box>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{
                    ml: 2,
                    color: "#64748b",
                    "&:hover": {
                        backgroundColor: "#f1f5f9",
                    },
                }}
            >
                {user?.photoURL ? (
                    <Avatar
                        src={user.photoURL}
                        sx={{ width: 32, height: 32 }}
                    />
                ) : (
                    <AccountCircle sx={{ fontSize: 32 }} />
                )}
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "12px",
                        mt: 1.5,
                        minWidth: 200,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#1e293b",
                            fontWeight: 600,
                            fontFamily: '"Noto Sans TC", sans-serif',
                        }}
                    >
                        {getDisplayName()}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#64748b",
                            fontFamily: '"Noto Sans TC", sans-serif',
                        }}
                    >
                        {user?.email}
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: "#cbd5e1" }} />

                <MenuItem
                    onClick={handleProfileClick}
                    sx={{
                        color: "#1e293b",
                        fontFamily: '"Noto Sans TC", sans-serif',
                        py: 1.5,
                        "&:hover": {
                            backgroundColor: "#f1f5f9",
                        },
                    }}
                >
                    <ListItemIcon>
                        <Person sx={{ color: "#3b82f6", fontSize: 20 }} />
                    </ListItemIcon>
                    個人設定
                </MenuItem>

                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: "#1e293b",
                        fontFamily: '"Noto Sans TC", sans-serif',
                        py: 1.5,
                        "&:hover": {
                            backgroundColor: "#f1f5f9",
                        },
                    }}
                >
                    <ListItemIcon>
                        <Logout sx={{ color: "#3b82f6", fontSize: 20 }} />
                    </ListItemIcon>
                    登出
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default UserProfileMenu;