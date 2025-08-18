import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Divider,
} from "@mui/material";
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    Brush,
    Palette,
    AutoAwesome,
} from "@mui/icons-material";
import {
    backgroundStyles,
    decorativeOrbs,
    cardStyles,
    logoIcons,
    titleStyles,
    subtitleStyles,
    errorBoxStyles,
    errorTextStyles,
    inputFieldStyles,
    buttonStyles,
    dividerStyles,
    modeHeaderStyles,
} from "../../styles/authStyles";

const AuthForm = ({
    isLogin,
    email,
    password,
    showPassword,
    isLoading,
    error,
    onEmailChange,
    onPasswordChange,
    onTogglePassword,
    onEmailAuth,
    onGoogleAuth,
}) => {
    const title = isLogin ? "歡迎回到 FeelInk" : "加入 FeelInk";
    const subtitle = isLogin ? "登入以繼續您的創作之旅" : "註冊帳號開始您的創作之旅";
    const modeTitle = isLogin ? "登入帳號" : "註冊帳號";
    const buttonText = isLogin ? "開始創作" : "建立帳號";
    const googleText = isLogin ? "使用 Google 登入" : "使用 Google 註冊";
    const linkText = isLogin ? "還沒有帳號？" : "已經有帳號？";
    const linkButtonText = isLogin ? "立即註冊" : "立即登入";
    const linkTo = isLogin ? "/register" : "/login";
    const passwordPlaceholder = isLogin ? "輸入您的密碼" : "設定您的密碼 (至少 6 位字符)";

    return (
        <Box sx={backgroundStyles}>
            <Box sx={decorativeOrbs[0]} />
            <Box sx={decorativeOrbs[1]} />
            <Box sx={decorativeOrbs[2]} />

            <Paper elevation={0} sx={cardStyles}>
                <Box sx={{ textAlign: "center", mb: 6 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 2,
                            mb: 4,
                        }}
                    >
                        <Box sx={logoIcons[0]}>
                            <Brush sx={{ color: "white", fontSize: 24 }} />
                        </Box>
                        <Box sx={logoIcons[1]}>
                            <Palette sx={{ color: "white", fontSize: 16 }} />
                        </Box>
                        <Box sx={logoIcons[2]}>
                            <AutoAwesome sx={{ color: "white", fontSize: 12 }} />
                        </Box>
                    </Box>

                    <Typography variant="h4" sx={titleStyles}>
                        {title}
                    </Typography>

                    <Typography variant="body1" sx={subtitleStyles}>
                        {subtitle}
                    </Typography>
                </Box>

                {error && (
                    <Box sx={errorBoxStyles}>
                        <Typography sx={errorTextStyles}>
                            {error}
                        </Typography>
                    </Box>
                )}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}
                >
                    <Typography variant="h6" sx={modeHeaderStyles}>
                        {modeTitle}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <TextField
                            type="email"
                            placeholder="輸入您的電子郵件"
                            value={email}
                            onChange={onEmailChange}
                            disabled={isLoading}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: "#94a3b8" }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputFieldStyles}
                        />

                        <TextField
                            type={showPassword ? "text" : "password"}
                            placeholder={passwordPlaceholder}
                            value={password}
                            onChange={onPasswordChange}
                            disabled={isLoading}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: "#94a3b8" }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={onTogglePassword}
                                            edge="end"
                                            sx={{ color: "#94a3b8" }}
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputFieldStyles}
                        />
                    </Box>

                    <Button
                        onClick={onEmailAuth}
                        disabled={isLoading}
                        sx={buttonStyles.primary}
                    >
                        <span>{buttonText}</span>
                    </Button>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Divider sx={dividerStyles} />
                        <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                            或
                        </Typography>
                        <Divider sx={dividerStyles} />
                    </Box>

                    <Button
                        onClick={onGoogleAuth}
                        disabled={isLoading}
                        variant="outlined"
                        sx={buttonStyles.secondary}
                    >
                        <Box
                            component="img"
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google"
                            sx={{ width: 20, height: 20, mr: 2 }}
                        />
                        {googleText}
                    </Button>
                </Box>

                <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#64748b",
                            fontSize: "14px",
                            fontFamily: '"Noto Sans TC", sans-serif',
                            display: "inline",
                        }}
                    >
                        {linkText}{" "}
                        <Button
                            component={Link}
                            to={linkTo}
                            variant="text"
                            sx={buttonStyles.link}
                        >
                            {linkButtonText}
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

AuthForm.propTypes = {
    isLogin: PropTypes.bool.isRequired,
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    showPassword: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    onEmailChange: PropTypes.func.isRequired,
    onPasswordChange: PropTypes.func.isRequired,
    onTogglePassword: PropTypes.func.isRequired,
    onEmailAuth: PropTypes.func.isRequired,
    onGoogleAuth: PropTypes.func.isRequired,
};

export default AuthForm;
