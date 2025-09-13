import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Chip,
    LinearProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import {
    ArrowBack,
    Psychology,
    Chat,
    Timeline,
    TrendingUp,
    SentimentSatisfied,
    SentimentDissatisfied,
    SentimentVeryDissatisfied,
    Favorite,
    Star,
    EmojiEmotions,
} from "@mui/icons-material";
import { loadEmotionAnalysisService, loadSummaryService, loadDemandAnalysisService, loadSentimentScoreService } from '../ChatRoom//helpers/MessageService';

const EmotionReportPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [emotionData, setEmotionData] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [demandData, setDemandData] = useState(null);
    const [sentimentScore, setSentimentScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const chatroomId = location.state?.chatroomId || "default-room-id";

    const handleReanalyze = async () => {
        try {
            setEmotionData(null);
            setSummaryData(null);
            setDemandData(null);
            setSentimentScore(null);
            setLoading(true);
            setError(null);

            const emotionResult = await loadEmotionAnalysisService(chatroomId);
            if (emotionResult.success) {
                setEmotionData(emotionResult.content);
            } else {
                setError(emotionResult.error || "載入情緒分析失敗");
            }

            try {
                const summaryResult = await loadSummaryService(chatroomId);
                if (summaryResult.success) {
                    setSummaryData(summaryResult.content);
                }
            } catch (summaryError) {
                console.warn("摘要載入失敗:", summaryError);
            }

            try {
                const demandResult = await loadDemandAnalysisService(chatroomId);
                if (demandResult.success) {
                    setDemandData(demandResult.content);
                }
            } catch (demandError) {
                console.warn("需求分析載入失敗:", demandError);
            }

            try {
                const sentimentResult = await loadSentimentScoreService(chatroomId);
                if (sentimentResult.success) {
                    setSentimentScore(sentimentResult.content);
                }
            } catch (sentimentError) {
                console.warn("情緒指數載入失敗:", sentimentError);
            }

        } catch (err) {
            setError("發生未知錯誤: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const emotionResult = await loadEmotionAnalysisService(chatroomId);

                if (emotionResult.success) {
                    setEmotionData(emotionResult.content);
                } else {
                    setError(emotionResult.error || "載入情緒分析失敗");
                }

                try {
                    const summaryResult = await loadSummaryService(chatroomId);
                    if (summaryResult.success) {
                        setSummaryData(summaryResult.content);
                    }
                } catch (summaryError) {
                    console.warn("摘要載入失敗，但不影響主要功能:", summaryError);
                }

                try {
                    const demandResult = await loadDemandAnalysisService(chatroomId);
                    if (demandResult.success) {
                        setDemandData(demandResult.content);
                    }
                } catch (demandError) {
                    console.warn("需求分析載入失敗，但不影響主要功能:", demandError);
                }

                try {
                    const sentimentResult = await loadSentimentScoreService(chatroomId);
                    if (sentimentResult.success) {
                        setSentimentScore(sentimentResult.content);
                    }
                } catch (sentimentError) {
                    console.warn("情緒指數載入失敗，但不影響主要功能:", sentimentError);
                }

            } catch (err) {
                setError("發生未知錯誤: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (chatroomId) {
            fetchData();
        }

        return () => {
            setEmotionData(null);
            setSummaryData(null);
            setDemandData(null);
            setSentimentScore(null);
            setLoading(true);
            setError(null);
        };
    }, [chatroomId]);

    const getMainEmotion = () => {
        if (!emotionData) return "平靜";

        const emotions = {
            "難過": emotionData.sadness || 0,
            "喜悅": emotionData.joy || 0,
            "興奮": emotionData.excited || 0,
            "焦慮": emotionData.anxiety || 0,
            "生氣": emotionData.anger || 0,
            "平靜": emotionData.calm || 0,
            "期待": emotionData.anticipation || 0,
            "樂觀": emotionData.optimism || 0,
        };
        return Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
    };

    const getEmotionColor = (emotion) => {
        const colors = {
            "難過": "#9e9e9e",
            "喜悅": "#4caf50",
            "興奮": "#ff9800",
            "焦慮": "#9c27b0",
            "生氣": "#f44336",
            "平靜": "#00bcd4",
            "期待": "#2196f3",
            "樂觀": "#ffeb3b",
        };
        return colors[emotion] || "#9e9e9e";
    };

    const getEmotionIcon = (emotion) => {
        switch (emotion) {
            case "喜悅":
                return <SentimentSatisfied sx={{ fontSize: 16, color: '#4caf50' }} />;
            case "樂觀":
                return <EmojiEmotions sx={{ fontSize: 16, color: '#ffeb3b' }} />;
            case "興奮":
                return <Star sx={{ fontSize: 16, color: '#ff9800' }} />;
            case "難過":
            case "焦慮":
                return <SentimentDissatisfied sx={{ fontSize: 16, color: getEmotionColor(emotion) }} />;
            case "生氣":
                return <SentimentVeryDissatisfied sx={{ fontSize: 16, color: getEmotionColor(emotion) }} />;
            case "平靜":
                return <Favorite sx={{ fontSize: 16, color: '#00bcd4' }} />;
            case "期待":
                return <Timeline sx={{ fontSize: 16, color: '#2196f3' }} />;
            default:
                return <Psychology sx={{ fontSize: 16 }} />;
        }
    };

    const getEmotionList = () => {
        if (!emotionData) return [];
        return [
            { name: "難過", value: emotionData.sadness || 0 },
            { name: "喜悅", value: emotionData.joy || 0 },
            { name: "興奮", value: emotionData.excited || 0 },
            { name: "焦慮", value: emotionData.anxiety || 0 },
            { name: "生氣", value: emotionData.anger || 0 },
            { name: "平靜", value: emotionData.calm || 0 },
            { name: "期待", value: emotionData.anticipation || 0 },
            { name: "樂觀", value: emotionData.optimism || 0 },
        ];
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
                    載入情緒分析中...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                p: 3
            }}>
                <Alert severity="error" sx={{ mb: 2, maxWidth: '400px' }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate('/canvas')}
                    startIcon={<ArrowBack />}
                >
                    返回畫布
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            p: { xs: 2, md: 4 }
        }}>
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                {/* 頂部導航 */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        onClick={() => navigate('/canvas')}
                        sx={{
                            backgroundColor: 'white',
                            boxShadow: 1,
                            '&:hover': { backgroundColor: '#f0f0f0' }
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                            情緒分析報表
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            了解你的情緒軌跡，探索內心的需求與成長
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* 主要情緒卡片和情緒指數卡片 - 放在同一行 */}
                    <Grid container spacing={3}>
                        {/* 主要情緒卡片 */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                                border: '1px solid #e2e8f0',
                                height: '100%'
                            }}>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Psychology sx={{ fontSize: 60, color: getEmotionColor(getMainEmotion()), mb: 2 }} />
                                    <Typography variant="h3" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: '#1e293b' }}>
                                        {getMainEmotion()}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary">
                                        今日主要情緒狀態
                                    </Typography>
                                    <Chip
                                        label={`情緒強度: ${emotionData ? Math.max(...Object.values({
                                            sadness: emotionData.sadness || 0,
                                            joy: emotionData.joy || 0,
                                            excited: emotionData.excited || 0,
                                            anxiety: emotionData.anxiety || 0,
                                            anger: emotionData.anger || 0,
                                            calm: emotionData.calm || 0,
                                            anticipation: emotionData.anticipation || 0,
                                            optimism: emotionData.optimism || 0,
                                        })).toFixed(1) : 0}/10`}
                                        sx={{
                                            mt: 2,
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            backgroundColor: '#3b82f6',
                                            color: 'white'
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 新增：當天情緒指數卡片 */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                                border: '1px solid #e2e8f0',
                                height: '100%'
                            }}>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <TrendingUp sx={{
                                        fontSize: 60,
                                        color: sentimentScore?.score >= 0 ? '#4caf50' : '#f44336',
                                        mb: 2
                                    }} />
                                    <Typography variant="h3" component="h2" sx={{
                                        fontWeight: 'bold',
                                        mb: 1,
                                        color: sentimentScore?.score >= 0 ? '#4caf50' : '#f44336'
                                    }}>
                                        {sentimentScore?.score !== undefined ? sentimentScore.score.toFixed(2) : '--'}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary">
                                        當天情緒指數
                                    </Typography>
                                    <Chip
                                        label={sentimentScore?.score !== undefined
                                            ? (sentimentScore.score >= 0.1 ? '正面' : sentimentScore.score <= -0.1 ? '負面' : '中性')
                                            : '無數據'
                                        }
                                        sx={{
                                            mt: 2,
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            backgroundColor: sentimentScore?.score >= 0.1 ? '#4caf50' :
                                                sentimentScore?.score <= -0.1 ? '#f44336' : '#9e9e9e',
                                            color: 'white'
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* 聊天摘要卡片 */}
                    <Card sx={{
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        border: '1px solid #e2e8f0',
                        position: 'relative'
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            {/* 右上角情緒標籤 */}
                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                <Chip
                                    icon={getEmotionIcon(getMainEmotion())}
                                    label={getMainEmotion()}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#e0f2fe',
                                        color: '#0369a1',
                                        fontWeight: 'bold',
                                        '& .MuiChip-icon': {
                                            color: getEmotionColor(getMainEmotion()) + ' !important'
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Chat sx={{ mr: 1, color: '#3b82f6', fontSize: 20 }} />
                                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    聊天摘要
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                最近與AI夥伴的對話重點
                            </Typography>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                {summaryData?.date || new Date().toLocaleDateString('zh-TW')}
                            </Typography>

                            <Box sx={{
                                p: 3,
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                pr: 8
                            }}>
                                <Typography variant="body1" sx={{
                                    lineHeight: 1.6,
                                    color: '#475569',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {summaryData?.summary || "今天與AI夥伴分享了完成專案的喜悅，討論了未來的學習計畫。AI給予了積極的回饋和建議。"}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* 詳細情緒分析 */}
                    <Card sx={{
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Timeline sx={{ mr: 1, color: '#3b82f6', fontSize: 20 }} />
                                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    詳細情緒分析
                                </Typography>
                            </Box>

                            <Grid container spacing={3}>
                                {getEmotionList().map((emotion, index) => (
                                    <Grid item xs={12} sm={6} md={3} key={index}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#374151' }}>
                                                {emotion.name}
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(emotion.value / 10) * 100}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    mb: 1,
                                                    backgroundColor: '#e5e7eb',
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: getEmotionColor(emotion.name),
                                                        borderRadius: 3
                                                    }
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {emotion.value.toFixed(1)} / 10.0
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card sx={{
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Psychology sx={{ mr: 1, color: '#3b82f6', fontSize: 20 }} />
                                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    需求分類細項
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                情緒背後的主要需求與渴望分析
                            </Typography>

                            <TableContainer component={Paper} sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>需求描述</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>當時情緒</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>時間</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow sx={{
                                            '&:hover': { backgroundColor: '#f8fafc' }
                                        }}>
                                            <TableCell sx={{ color: '#475569' }}>
                                                {demandData  || "需要被理解和傾聽"}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getEmotionIcon(getMainEmotion())}
                                                    <Chip
                                                        label={getMainEmotion()}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#e0f2fe',
                                                            color: '#0369a1',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: '#6b7280', fontSize: '14px' }}>
                                                {summaryData?.date || new Date().toLocaleDateString('zh-TW')}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                    {/* 操作按鈕 */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'center',
                        flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                        <Button
                            variant="contained"
                            startIcon={<Chat />}
                            onClick={() => navigate('/canvas')}
                            sx={{
                                px: 4,
                                py: 1.5,
                                backgroundColor: '#3b82f6',
                                '&:hover': {
                                    backgroundColor: '#2563eb'
                                }
                            }}
                        >
                            與AI夥伴聊聊
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<TrendingUp />}
                            onClick={handleReanalyze}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderColor: '#d1d5db',
                                color: '#4b5563',
                                '&:hover': {
                                    backgroundColor: '#f9fafb',
                                    borderColor: '#3b82f6'
                                }
                            }}
                        >
                            重新分析
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default EmotionReportPage;
