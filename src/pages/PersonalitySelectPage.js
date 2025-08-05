import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid2, Card, CardContent, Button, Box, Avatar } from '@mui/material';
import { Palette as CreativeIcon, Search as CuriousIcon, Favorite as WarmIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

const PersonalitySelectPage = () => {
    const navigate = useNavigate();
    const [selectedPersonality, setSelectedPersonality] = useState(null);

    const personalities = [
        {
            id: 'creative',
            name: '創意夥伴',
            description: '充滿創意靈感的藝術夥伴，提供意想不到的創作建議，鼓勵突破常規的表達方式',
            icon: <CreativeIcon sx={{ fontSize: 40 }} />,
            color: '#FF6B6B',
            features: [
                '提供創意靈感',
                '跨領域連結',
                '鼓勵實驗性表達',
                '突破常規思維'
            ]
        },
        {
            id: 'curious',
            name: '好奇分析師',
            description: '充滿好奇心的藝術分析師，深入探討創作背後的心理',
            icon: <CuriousIcon sx={{ fontSize: 40 }} />,
            color: '#4ECDC4',
            features: [
                '深度分析探討',
                '提供專業見解',
                '引導性問句',
                '分享藝術理論'
            ]
        },
        {
            id: 'warm',
            name: '溫暖導師',
            description: '溫暖關懷的繪畫導師，提供鼓勵和支持，創造安全的表達環境',
            icon: <WarmIcon sx={{ fontSize: 40 }} />,
            color: '#45B7D1',
            features: [
                '溫暖鼓勵回饋',
                '創造安全環境',
                '循序漸進指導',
                '同理心回應'
            ]
        }
    ];

    const handleSelectPersonality = (personalityId) => {
        setSelectedPersonality(personalityId);
    };

    const handleConfirm = () => {
        if (selectedPersonality) {
            localStorage.setItem('selectedPersonality', selectedPersonality);
            const newSessionId = uuidv4();
            localStorage.setItem('currentSessionId', newSessionId);
            console.log(`已選擇個性: ${selectedPersonality}, SessionId: ${newSessionId}`);

            navigate('/canvas');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    選擇你的 AI 夥伴
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    選擇一位陪伴你創作旅程的 AI 夥伴，每位都有獨特的個性和專長
                </Typography>
            </Box>

            <Grid2 container spacing={3} justifyContent="center" sx={{ maxWidth: '1200px', mx: 'auto' }}>
                {personalities.map((personality) => (
                    <Grid2
                        key={personality.id}
                        xs={12}
                        sm={6}
                        lg={4}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <Card
                            sx={{
                                width: '100%',
                                maxWidth: '350px',
                                minHeight: '400px',
                                cursor: 'pointer',
                                border: selectedPersonality === personality.id ? 3 : 1,
                                borderColor: selectedPersonality === personality.id ? personality.color : 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => handleSelectPersonality(personality.id)}
                        >
                            <CardContent sx={{
                                textAlign: 'center',
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: personality.color,
                                            width: 80,
                                            height: 80,
                                            mx: 'auto',
                                            mb: 2
                                        }}
                                    >
                                        {personality.icon}
                                    </Avatar>

                                    <Typography variant="h5" component="h2" gutterBottom>
                                        {personality.name}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {personality.description}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                        特色功能：
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}>
                                        {personality.features.map((feature, index) => (
                                            <Typography
                                                key={index}
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                • {feature}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid2>
                ))}
            </Grid2>

            <Box textAlign="center" mt={4}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleConfirm}
                    disabled={!selectedPersonality}
                    sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem'
                    }}
                >
                    開始創作旅程
                </Button>
            </Box>
        </Container>
    );
};

export default PersonalitySelectPage;
