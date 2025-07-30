import { Box, CircularProgress, Typography } from '@mui/material';
import { AutoAwesome, Brush, Palette } from '@mui/icons-material';
import {
    backgroundStyles,
    decorativeOrbs,
    cardStyles,
    logoIcons,
    titleStyles,
} from '../../styles/authStyles';

const AppLoader = () => {
    return (
        <Box sx={backgroundStyles}>
            <Box sx={decorativeOrbs[0]} />
            <Box sx={decorativeOrbs[1]} />
            <Box sx={decorativeOrbs[2]} />

            <Box sx={{ ...cardStyles, textAlign: "center" }}>
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
                    Feelink
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <CircularProgress 
                        size={48}
                        thickness={3}
                        sx={{
                            color: "#3b82f6",
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            },
                        }}
                    />
                </Box>

                <Typography 
                    variant="body1" 
                    sx={{
                        fontFamily: '"Noto Sans TC", sans-serif',
                        color: "#64748b",
                        fontSize: "16px",
                        lineHeight: 1.6,
                    }}
                >
                    載入中，請稍候...
                </Typography>
            </Box>
        </Box>
    );
};

export default AppLoader;
