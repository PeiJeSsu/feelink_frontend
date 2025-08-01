import { useState } from "react";
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

const UserProfileMenu = () => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
        } catch (error) {
            console.error("登出失敗:", error);
        }
    };

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{
                    ml: 2,
                    color: "#5c5c5c",
                    "&:hover": {
                        backgroundColor: "rgba(247, 202, 201, 0.1)",
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
                        backgroundColor: "#fffff3",
                        border: "1px solid rgba(92, 92, 92, 0.15)",
                        borderRadius: "8px",
                        mt: 1.5,
                        minWidth: 200,
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#5c5c5c",
                            fontWeight: 600,
                            fontFamily: '"Noto Sans TC", sans-serif',
                        }}
                    >
                        {user?.displayName || "使用者"}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#888",
                            fontFamily: '"Noto Sans TC", sans-serif',
                        }}
                    >
                        {user?.email}
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: "rgba(92, 92, 92, 0.15)" }} />

                <MenuItem
                    onClick={handleClose}
                    sx={{
                        color: "#5c5c5c",
                        fontFamily: '"Noto Sans TC", sans-serif',
                        "&:hover": {
                            backgroundColor: "rgba(247, 202, 201, 0.1)",
                        },
                    }}
                >
                    <ListItemIcon>
                        <Person sx={{ color: "#f7cac9" }} />
                    </ListItemIcon>
                    個人資料
                </MenuItem>

                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: "#5c5c5c",
                        fontFamily: '"Noto Sans TC", sans-serif',
                        "&:hover": {
                            backgroundColor: "rgba(247, 202, 201, 0.1)",
                        },
                    }}
                >
                    <ListItemIcon>
                        <Logout sx={{ color: "#f7cac9" }} />
                    </ListItemIcon>
                    登出
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default UserProfileMenu;
