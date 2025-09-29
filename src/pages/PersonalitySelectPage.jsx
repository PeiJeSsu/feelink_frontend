import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import { 
    Container, 
    Typography, 
    Grid2, 
    Card, 
    CardContent, 
    Button, 
    Box, 
    Avatar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import { 
    Palette as CreativeIcon, 
    Search as CuriousIcon, 
    Favorite as WarmIcon,
    Person as PersonIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import UserService from '../helpers/personality/UserService'; 

const PersonalitySelectPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user, refreshPersonalityStatus } = useContext(AuthContext);
    const [selectedPersonality, setSelectedPersonality] = useState(null);
    const [nickname, setNickname] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('zh-TW');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 初始化已儲存的設定
    useEffect(() => {
        const savedNickname = localStorage.getItem('userNickname');
        const savedLanguage = localStorage.getItem('preferredLanguage');
        const savedPersonality = localStorage.getItem('selectedPersonality');

        if (savedNickname) {
            setNickname(savedNickname);
        }
        if (savedLanguage) {
            setPreferredLanguage(savedLanguage);
            i18n.changeLanguage(savedLanguage);
        }
        if (savedPersonality) {
            setSelectedPersonality(savedPersonality);
        }
        
        // 如果有儲存的個性和語言，確保 AI 名字是最新的
        if (savedPersonality && savedLanguage) {
            const updateAIName = () => {
                const personalityNames = {
                    'zh-TW': {
                        creative: '謬思',
                        curious: '奇奇', 
                        warm: '暖暖'
                    },
                    'en-US': {
                        creative: 'Muse',
                        curious: 'QiQi',
                        warm: 'NuanNuan'
                    }
                };
                
                const names = personalityNames[savedLanguage] || personalityNames['zh-TW'];
                const aiName = names[savedPersonality] || 'AI夥伴';
                localStorage.setItem('aiPartnerName', aiName);
            };
            updateAIName();
        }
    }, [i18n]);

    const languages = [
        { value: 'zh-TW', label: t('personalSettings.languageOptions.zh-TW') },
        { value: 'en-US', label: t('personalSettings.languageOptions.en-US') },
    ];

    const personalities = [
        {
            id: 'creative',
            name: t('personalSettings.personalities.creative.name'),
            description: t('personalSettings.personalities.creative.description'),
            icon: <CreativeIcon sx={{ fontSize: 40 }} />,
            color: '#FF6B6B',
            features: t('personalSettings.personalities.creative.features', { returnObjects: true })
        },
        {
            id: 'curious',
            name: t('personalSettings.personalities.curious.name'),
            description: t('personalSettings.personalities.curious.description'),
            icon: <CuriousIcon sx={{ fontSize: 40 }} />,
            color: '#4ECDC4',
            features: t('personalSettings.personalities.curious.features', { returnObjects: true })
        },
        {
            id: 'warm',
            name: t('personalSettings.personalities.warm.name'),
            description: t('personalSettings.personalities.warm.description'),
            icon: <WarmIcon sx={{ fontSize: 40 }} />,
            color: '#45B7D1',
            features: t('personalSettings.personalities.warm.features', { returnObjects: true })
        }
    ];

    const handleSelectPersonality = (personalityId) => {
        setSelectedPersonality(personalityId);
        setError(null);
    };

    const handleLanguageChange = (newLanguage) => {
        setPreferredLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
        
        if (selectedPersonality) {
            const personalityNames = {
                'zh-TW': {
                    creative: '謬思',
                    curious: '奇奇', 
                    warm: '暖暖'
                },
                'en-US': {
                    creative: 'Muse',
                    curious: 'QiQi',
                    warm: 'NuanNuan'
                }
            };
            
            const names = personalityNames[newLanguage] || personalityNames['zh-TW'];
            const aiName = names[selectedPersonality] || 'AI夥伴';
            localStorage.setItem('aiPartnerName', aiName);
        }
    };

    const handleConfirm = async () => {
        if (!selectedPersonality || !nickname.trim()) {
            return;
        }

        if (!user) {
            setError('請先登入後再進行設定');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userId = user.uid;
            const userEmail = user.email || '';
            
            const userData = {
                userId: userId, 
                nickname: nickname.trim(),
                AINickname: UserService.getAIPartnerDisplayName(selectedPersonality, preferredLanguage),
                email: userEmail,
                preferredAIPartner: UserService.mapPersonalityToAIPartner(selectedPersonality)
            };

            console.log('準備同步使用者資料:', userData);

            const syncedUser = await UserService.syncUser(userData);
            
            console.log('使用者資料同步成功:', syncedUser);

            localStorage.setItem('userId', userId); 
            localStorage.setItem('userEmail', userEmail); 
            localStorage.setItem('selectedPersonality', selectedPersonality);
            localStorage.setItem('userNickname', nickname.trim());
            localStorage.setItem('preferredLanguage', preferredLanguage);
            localStorage.setItem('aiPartnerName', userData.AINickname);
            
            window.dispatchEvent(new Event('nicknameUpdated'));
            
            const newSessionId = uuidv4();
            localStorage.setItem('currentSessionId', newSessionId);

            console.log(`設定完成 - 個性: ${selectedPersonality}, 暱稱: ${nickname}, 語言: ${preferredLanguage}, AI名字: ${userData.AINickname}, SessionId: ${newSessionId}`);

            await refreshPersonalityStatus();
            
            navigate('/canvas');

        } catch (error) {
            console.error('同步使用者資料時發生錯誤:', error);
            setError(error.message || '保存設定時發生錯誤，請稍後再試');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', backgroundColor: '#ffffff' }}>
            {/* 主標題 */}
            <Box textAlign="center" mb={6}>
                <Typography variant="h4" component="h1" gutterBottom 
                    sx={{ 
                        fontWeight: 700,
                        color: "#1e293b",
                        fontFamily: '"Noto Sans TC", sans-serif'
                    }}
                >
                    {t('personalSettings.title')}
                </Typography>
                <Typography variant="h6" color="text.secondary"
                    sx={{ 
                        color: "#64748b",
                        fontFamily: '"Noto Sans TC", sans-serif'
                    }}
                >
                    {t('personalSettings.subtitle')}
                </Typography>
            </Box>

            {/* 錯誤訊息 */}
            {error && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>
                        {error}
                    </Alert>
                </Box>
            )}

            {/* 上半部：使用者設置區 */}
            <Paper 
                elevation={0} 
                sx={{ 
                    mb: 4, 
                    p: 4, 
                    borderRadius: '16px', 
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Typography variant="h5" component="h2" gutterBottom 
                    sx={{ 
                        fontWeight: 600,
                        color: "#1e293b",
                        fontFamily: '"Noto Sans TC", sans-serif',
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <PersonIcon sx={{ color: '#3b82f6' }} />
                    {t('personalSettings.basicSettings')}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {/* 暱稱設定 */}
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                        <TextField
                            fullWidth
                            label={t('personalSettings.nickname')}
                            placeholder={t('personalSettings.nicknamePlaceholder')}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            disabled={isLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc',
                                    '& fieldset': {
                                        borderColor: '#cbd5e1',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#3b82f6',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#3b82f6',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontFamily: '"Noto Sans TC", sans-serif',
                                },
                                '& .MuiOutlinedInput-input': {
                                    fontFamily: '"Noto Sans TC", sans-serif',
                                }
                            }}
                        />
                    </Box>

                    {/* 語言設定 */}
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                        <FormControl fullWidth>
                            <InputLabel id="language-label" 
                                sx={{ fontFamily: '"Noto Sans TC", sans-serif' }}
                            >
                                {t('personalSettings.language')}
                            </InputLabel>
                            <Select
                                labelId="language-label"
                                value={preferredLanguage}
                                label={t('personalSettings.language')}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                disabled={isLoading}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#cbd5e1',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3b82f6',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3b82f6',
                                    },
                                    '& .MuiSelect-select': {
                                        fontFamily: '"Noto Sans TC", sans-serif',
                                    }
                                }}
                            >
                                {languages.map((lang) => (
                                    <MenuItem 
                                        key={lang.value} 
                                        value={lang.value}
                                        sx={{ fontFamily: '"Noto Sans TC", sans-serif' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LanguageIcon sx={{ fontSize: 20, color: '#64748b' }} />
                                            {lang.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Paper>

            {/* 分隔線 */}
            <Divider sx={{ mb: 4, backgroundColor: '#cbd5e1' }} />

            {/* 下半部：AI 夥伴選擇區 */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    borderRadius: '16px', 
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Typography variant="h5" component="h2" gutterBottom 
                    sx={{ 
                        fontWeight: 600,
                        color: "#1e293b",
                        fontFamily: '"Noto Sans TC", sans-serif',
                        mb: 3,
                        textAlign: 'center'
                    }}
                >
                    {t('personalSettings.aiPartnerSection.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" 
                    sx={{ 
                        textAlign: 'center',
                        mb: 4,
                        color: "#64748b",
                        fontFamily: '"Noto Sans TC", sans-serif'
                    }}
                >
                    {t('personalSettings.aiPartnerSection.subtitle')}
                </Typography>

                <Grid2 container spacing={3} justifyContent="center" sx={{ maxWidth: '1300px', mx: 'auto' }}>
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
                                    maxWidth: '360px', 
                                    minHeight: '480px', 
                                    cursor: isLoading ? 'default' : 'pointer',
                                    border: '1px solid #cbd5e1',
                                    outline: selectedPersonality === personality.id ? `3px solid ${personality.color}` : 'none',
                                    outlineOffset: selectedPersonality === personality.id ? '-1px' : '0px',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: selectedPersonality === personality.id ? 
                                        `${personality.color}05` : '#ffffff',
                                    boxSizing: 'border-box',
                                    opacity: isLoading ? 0.7 : 1,
                                    '&:hover': !isLoading ? {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                                        outline: `3px solid ${personality.color}`,
                                        outlineOffset: '-1px'
                                    } : {},
                                    '& .MuiCardContent-root': {
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }
                                }}
                                onClick={() => !isLoading && handleSelectPersonality(personality.id)}
                            >
                                <CardContent sx={{
                                    textAlign: 'center',
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: personality.color,
                                                width: 80,
                                                height: 80,
                                                mx: 'auto',
                                                mb: 2,
                                                boxShadow: `0 4px 15px ${personality.color}40`
                                            }}
                                        >
                                            {personality.icon}
                                        </Avatar>

                                        <Typography variant="h5" component="h2" gutterBottom
                                            sx={{
                                                fontFamily: '"Noto Sans TC", sans-serif',
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                fontSize: '1.3rem', 
                                                lineHeight: 1.3, 
                                                minHeight: '40px' 
                                            }}
                                        >
                                            {personality.name}
                                        </Typography>

                                        <Box sx={{ 
                                            minHeight: '72px',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            mb: 2
                                        }}>
                                            <Typography variant="body2" color="text.secondary" 
                                                sx={{
                                                    fontFamily: '"Noto Sans TC", sans-serif',
                                                    color: '#64748b',
                                                    lineHeight: 1.6,
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {personality.description}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="subtitle2" gutterBottom 
                                            sx={{ 
                                                mb: 2,
                                                fontFamily: '"Noto Sans TC", sans-serif',
                                                fontWeight: 600,
                                                color: '#374151',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {t('personalSettings.aiPartnerSection.features')}
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            width: '100%'
                                        }}>
                                            {personality.features.map((feature) => (
                                                <Box
                                                    key={`${personality.id}-${feature}`}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        width: 'fit-content',
                                                        maxWidth: '90%'
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            backgroundColor: personality.color,
                                                            marginRight: '8px',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontFamily: '"Noto Sans TC", sans-serif',
                                                            color: '#6b7280',
                                                            fontSize: '12px',
                                                            textAlign: 'left',
                                                            lineHeight: 1.3
                                                        }}
                                                    >
                                                        {feature}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            </Paper>

            {/* 確認按鈕 */}
            <Box textAlign="center" mt={6}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleConfirm}
                    disabled={!selectedPersonality || !nickname.trim() || isLoading || !user}
                    sx={{
                        px: 6,
                        py: 2,
                        fontSize: '1.2rem',
                        fontFamily: '"Noto Sans TC", sans-serif',
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': !isLoading ? {
                            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)',
                        } : {},
                        '&:disabled': {
                            background: '#cbd5e1',
                            color: '#9ca3af',
                            boxShadow: 'none',
                            transform: 'none'
                        }
                    }}
                >
                    {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={20} sx={{ color: 'inherit' }} />
                            正在保存設定...
                        </Box>
                    ) : (
                        t('personalSettings.startButton')
                    )}
                </Button>
                
                {(!selectedPersonality || !nickname.trim() || !user) && !isLoading && (
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block',
                            mt: 2,
                            color: '#ff0000',
                            fontFamily: '"Noto Sans TC", sans-serif'
                        }}
                    >
                        {!user ? '請先登入後再進行設定' : t('personalSettings.validationMessage')}
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default PersonalitySelectPage;