import {useState, useEffect, useCallback} from "react";
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
    Paper,
    Divider
} from "@mui/material";
import {
    ArrowBack,
    Psychology,
    TrendingUp,
    SentimentSatisfied,
    SentimentDissatisfied,
    SentimentVeryDissatisfied,
    Favorite,
    Star,
    EmojiEmotions,
} from "@mui/icons-material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { loadAnalyzeAndSaveToday, loadLatestAnalysisForChatroomsService } from '../ChatRoom/helpers/MessageService';
import { getUserChatrooms } from '../ChatRoom/helpers/MessageAPI';

const EmotionReportPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    
    // 折線圖相關狀態
    const [chatroomSummaries, setChatroomSummaries] = useState([]);
    const [chatroomAnalysesMap, setChatroomAnalysesMap] = useState({}); // 儲存完整的分析資料
    const [selectedChatroom, setSelectedChatroom] = useState(null);
    const [chartLoading, setChartLoading] = useState(true);
    
    // 詳細報表相關狀態
    const [emotionData, setEmotionData] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [demandData, setDemandData] = useState(null);
    const [sentimentScore, setSentimentScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 從 URL 參數獲取 chatroomId（如果有的話）
    const initialChatroomId = location.state?.chatroomId;

    // 載入所有聊天室的情緒分析摘要
    useEffect(() => {
        const fetchChatroomSummaries = async () => {
            try {
                setChartLoading(true);
                setError(null);

                if (!userId) {
                    setError("請先登入");
                    return;
                }

                // 獲取使用者的所有聊天室
                const chatrooms = await getUserChatrooms(userId);
                if (!chatrooms || chatrooms.length === 0) {
                    setChatroomSummaries([]);
                    setChartLoading(false);
                    return;
                }

                const chatroomIds = chatrooms.map(room => room.chatroomId);

                // 獲取所有聊天室的最新情緒分析
                const analyses = await loadLatestAnalysisForChatroomsService(chatroomIds);

                // 建立分析資料的 Map，以 chatroomId 為 key
                const analysesMap = {};
                analyses.forEach(analysis => {
                    analysesMap[analysis.chatroomId] = analysis;
                });
                setChatroomAnalysesMap(analysesMap);

                // 獲取所有聊天室的畫布縮圖
                const { getChatroomCanvasImage } = await import('../ChatRoom/helpers/MessageAPI');
                const canvasPromises = chatroomIds.map(id => 
                    getChatroomCanvasImage(id).catch(() => null)
                );
                const canvasResults = await Promise.all(canvasPromises);
                const canvasMap = {};
                chatroomIds.forEach((id, index) => {
                    if (canvasResults[index]?.canvasImageUrl) {
                        canvasMap[id] = canvasResults[index].canvasImageUrl;
                    }
                });

                // 將聊天室資訊和分析結果合併
                const summaries = chatrooms.map(room => {
                    const analysis = analyses.find(a => a.chatroomId === room.chatroomId);
                    return {
                        chatroomId: room.chatroomId,
                        title: room.title,
                        score: analysis?.score || 0,
                        magnitude: analysis?.magnitude || 0,
                        dateString: analysis?.dateString || '',
                        hasAnalysis: !!analysis,
                        canvasImageUrl: canvasMap[room.chatroomId] || null
                    };
                });

                // 按日期排序
                summaries.sort((a, b) => {
                    if (!a.dateString) return 1;
                    if (!b.dateString) return -1;
                    return a.dateString.localeCompare(b.dateString);
                });

                setChatroomSummaries(summaries);

                // 如果有指定的聊天室 ID，自動選擇它
                if (initialChatroomId) {
                    const targetSummary = summaries.find(s => s.chatroomId === initialChatroomId);
                    if (targetSummary && targetSummary.hasAnalysis) {
                        setSelectedChatroom(targetSummary);
                    }
                }

            } catch (err) {
                console.error('載入聊天室摘要失敗:', err);
                setError("載入情緒分析資料失敗");
            } finally {
                setChartLoading(false);
            }
        };

        fetchChatroomSummaries();
    }, [userId, initialChatroomId]);

    // 載入選中聊天室的詳細情緒報表
    const loadDetailedReport = useCallback(async (chatroomId) => {
        try {
            setLoading(true);
            setError(null);

            // 先檢查是否已有分析資料
            let analysis = chatroomAnalysesMap[chatroomId];

            // 如果沒有分析資料，執行分析
            if (!analysis || !analysis.emotions) {
                console.log(`聊天室 ${chatroomId} 尚無分析資料，開始執行分析...`);
                
                try {
                    const newAnalysis = await loadAnalyzeAndSaveToday(chatroomId);
                    
                    if (newAnalysis && newAnalysis.emotions) {
                        analysis = newAnalysis;
                        
                        // 更新分析資料 Map
                        setChatroomAnalysesMap(prev => ({
                            ...prev,
                            [chatroomId]: newAnalysis
                        }));

                        // 更新折線圖中的數據
                        setChatroomSummaries(prev => prev.map(s => 
                            s.chatroomId === chatroomId 
                                ? { 
                                    ...s, 
                                    score: newAnalysis.score, 
                                    magnitude: newAnalysis.magnitude,
                                    dateString: newAnalysis.dateString,
                                    hasAnalysis: true 
                                }
                                : s
                        ));
                    } else {
                        setError("該聊天室分析失敗，請稍後再試");
                        return;
                    }
                } catch (analyzeErr) {
                    console.error('執行分析失敗:', analyzeErr);
                    setError("該聊天室尚無對話記錄或分析失敗");
                    return;
                }
            }

            // 顯示分析資料
            if (analysis && analysis.emotions) {
                setEmotionData(analysis.emotions);
                setSummaryData({
                    summary: analysis.summary,
                    date: analysis.dateString
                });
                setDemandData(analysis.demand);
                setSentimentScore({
                    score: analysis.score,
                    magnitude: analysis.magnitude
                });
            }

        } catch (err) {
            console.error('載入詳細報表失敗:', err);
            setError("載入詳細報表失敗");
        } finally {
            setLoading(false);
        }
    }, [chatroomAnalysesMap]);

    // 當選擇聊天室時載入詳細報表
    useEffect(() => {
        if (selectedChatroom) {
            // 無論是否有分析資料都嘗試載入（函數內部會自動處理分析）
            loadDetailedReport(selectedChatroom.chatroomId);
        } else {
            // 清空詳細報表
            setEmotionData(null);
            setSummaryData(null);
            setDemandData(null);
            setSentimentScore(null);
        }
    }, [selectedChatroom, loadDetailedReport]);

    // 重新分析當前選中的聊天室
    const handleReanalyze = async () => {
        if (!selectedChatroom) return;

        try {
            setLoading(true);
            setError(null);

            const newAnalysisResult = await loadAnalyzeAndSaveToday(selectedChatroom.chatroomId);

            if (newAnalysisResult && newAnalysisResult.emotions) {
                setEmotionData(newAnalysisResult.emotions);
                setSummaryData({
                    summary: newAnalysisResult.summary,
                    date: newAnalysisResult.dateString
                });
                setDemandData(newAnalysisResult.demand);
                setSentimentScore({
                    score: newAnalysisResult.score,
                    magnitude: newAnalysisResult.magnitude
                });

                // 更新折線圖中的數據
                setChatroomSummaries(prev => prev.map(s => 
                    s.chatroomId === selectedChatroom.chatroomId 
                        ? { ...s, score: newAnalysisResult.score, magnitude: newAnalysisResult.magnitude, hasAnalysis: true }
                        : s
                ));

                // 更新分析資料 Map
                setChatroomAnalysesMap(prev => ({
                    ...prev,
                    [selectedChatroom.chatroomId]: newAnalysisResult
                }));
            } else {
                setError("重新分析失敗");
            }

        } catch (err) {
            console.error('重新分析錯誤:', err);
            setError("重新分析失敗: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // 點擊折線圖上的點
    const handleChartPointClick = (summary) => {
        setSelectedChatroom(summary);
    };

    const getMainEmotion = () => {
        if (!emotionData) return "平靜";

        const emotions = {
            "難過": emotionData["難過"] || 0,
            "喜悅": emotionData["喜悅"] || 0,
            "興奮": emotionData["興奮"] || 0,
            "焦慮": emotionData["焦慮"] || 0,
            "生氣": emotionData["生氣"] || 0,
            "平靜": emotionData["平靜"] || 0,
            "期待": emotionData["期待"] || 0,
            "樂觀": emotionData["樂觀"] || 0,
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
                return <Star sx={{ fontSize: 16, color: '#2196f3' }} />;
            default:
                return <Psychology sx={{ fontSize: 16 }} />;
        }
    };

    const getEmotionList = () => {
        if (!emotionData) return [];
        return [
            { name: "難過", value: emotionData["難過"] || 0 },
            { name: "喜悅", value: emotionData["喜悅"] || 0 },
            { name: "興奮", value: emotionData["興奮"] || 0 },
            { name: "焦慮", value: emotionData["焦慮"] || 0 },
            { name: "生氣", value: emotionData["生氣"] || 0 },
            { name: "平靜", value: emotionData["平靜"] || 0 },
            { name: "期待", value: emotionData["期待"] || 0 },
            { name: "樂觀", value: emotionData["樂觀"] || 0 },
        ];
    };

    // 自定義 Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box sx={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    p: 1.5,
                    boxShadow: 2
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {data.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        情緒指數: {data.score?.toFixed(2) || 'N/A'}
                    </Typography>
                    {data.dateString && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            更新日期: {data.dateString}
                        </Typography>
                    )}
                    {!data.hasAnalysis && (
                        <Typography variant="caption" display="block" color="warning.main">
                            點擊進行分析
                        </Typography>
                    )}
                </Box>
            );
        }
        return null;
    };

    // 渲染折線圖
    const renderLineChart = () => {
        if (chatroomSummaries.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        暫無情緒分析資料
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        請先在聊天室中與 AI 夥伴對話，系統會自動生成情緒分析
                    </Typography>
                </Box>
            );
        }

        // 準備圖表資料 - 在前後添加空白資料點來創造邊距
        const actualData = chatroomSummaries.map((summary, index) => ({
            name: summary.title.length > 15 ? summary.title.substring(0, 15) + '...' : summary.title,
            score: summary.hasAnalysis ? summary.score : 0, // 未分析的點放在 0
            chatroomId: summary.chatroomId,
            hasAnalysis: summary.hasAnalysis,
            dateString: summary.dateString,
            canvasImageUrl: summary.canvasImageUrl,
            isSelected: selectedChatroom?.chatroomId === summary.chatroomId
        }));

        // 在前後添加空資料點以創造邊距
        const chartData = [
            { name: '', score: null, isEmpty: true }, // 左側空白
            ...actualData,
            { name: '', score: null, isEmpty: true }  // 右側空白
        ];

        // 自定義點的渲染
        const CustomDot = (props) => {
            const { cx, cy, payload } = props;
            
            // 如果是空白點，不渲染
            if (payload.isEmpty) {
                return null;
            }
            
            const isSelected = payload.isSelected;
            const hasAnalysis = payload.hasAnalysis;
            
            return (
                <g onClick={() => handleChartPointClick(chatroomSummaries.find(s => s.chatroomId === payload.chatroomId))}>
                    {/* 透明的可點擊區域 - 增大點擊範圍 */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={20}
                        fill="transparent"
                        style={{ cursor: 'pointer' }}
                    />
                    {/* 實際顯示的點 */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill={isSelected ? '#ff5722' : hasAnalysis ? '#5470c6' : '#9e9e9e'}
                        stroke="white"
                        strokeWidth={2}
                        style={{ cursor: 'pointer', pointerEvents: 'none' }}
                    />
                </g>
            );
        };

        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="name" 
                            angle={0}
                            textAnchor="middle"
                            height={60}
                            tick={{ fontSize: 11, fill: '#666' }}
                            interval={0}
                            tickLine={false}
                        />
                        <YAxis 
                            domain={[-1, 1]}
                            ticks={[-1, -0.5, 0, 0.5, 1]}
                            tick={{ fontSize: 12, fill: '#666' }}
                            label={{ value: '情緒指數', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                        />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={false}
                            offset={10}
                            wrapperStyle={{ pointerEvents: 'none' }}
                        />
                        <ReferenceLine y={0} stroke="#d0d0d0" strokeDasharray="3 3" />
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#5470c6" 
                            strokeWidth={3}
                            dot={<CustomDot />}
                            connectNulls={true}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* 圖例說明 */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        點擊圖表上的點可查看該聊天室的詳細情緒報表
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: '#5470c6',
                                border: '2px solid white'
                            }} />
                            <Typography variant="caption" color="text.secondary">
                                已分析
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: '#9e9e9e',
                                border: '2px solid white'
                            }} />
                            <Typography variant="caption" color="text.secondary">
                                尚未分析（點擊分析）
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: '#ff5722',
                                border: '2px solid white'
                            }} />
                            <Typography variant="caption" color="text.secondary">
                                已選擇
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    };

    if (chartLoading) {
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
                    載入情緒分析資料中...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            p: { xs: 2, md: 4 }
        }}>
            <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
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
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* 折線圖卡片 */}
                <Card sx={{
                    backgroundColor: 'white',
                    border: '1.5px solid #9ca3af',
                    borderRadius: 2,
                    mb: 4,
                    boxShadow: 'none'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 3 }}>
                            情緒趨勢
                        </Typography>
                        {renderLineChart()}
                    </CardContent>
                </Card>

                {/* 分隔線 */}
                {selectedChatroom && (
                    <>
                        <Divider sx={{ my: 4 }}>
                            <Chip 
                                label={`${selectedChatroom.title} 的詳細報表`}
                                sx={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    px: 2
                                }}
                            />
                        </Divider>

                        {loading ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress size={60} />
                                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
                                    載入詳細報表中...
                                </Typography>
                            </Box>
                        ) : emotionData ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* 主要情緒卡片和情緒指數卡片 */}
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{
                                            backgroundColor: 'white',
                                            border: '1.5px solid #9ca3af',
                                            borderRadius: 2,
                                            height: '100%',
                                            boxShadow: 'none'
                                        }}>
                                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                                <Psychology sx={{ fontSize: 60, color: getEmotionColor(getMainEmotion()), mb: 2 }} />
                                                <Typography variant="h3" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: '#1e293b' }}>
                                                    {getMainEmotion()}
                                                </Typography>
                                                <Typography variant="h6" color="text.secondary">
                                                    主要情緒狀態
                                                </Typography>
                                                <Chip
                                                    label={`情緒強度: ${emotionData ? Math.max(...getEmotionList().map(e => e.value)).toFixed(1) : 0}/10`}
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

                                    <Grid item xs={12} md={6}>
                                        <Card sx={{
                                            backgroundColor: 'white',
                                            border: '1.5px solid #9ca3af',
                                            borderRadius: 2,
                                            height: '100%',
                                            boxShadow: 'none'
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
                                                    情緒指數
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

                                {/* 聊天紀錄卡片 */}
                                <Card sx={{
                                    backgroundColor: 'white',
                                    border: '1.5px solid #9ca3af',
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    position: 'relative'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
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

                                        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 3 }}>
                                            聊天紀錄
                                        </Typography>

                                        {/* 聊天摘要表格 */}
                                        <Box sx={{ mb: 3 }}>
                                            <TableContainer component={Paper} sx={{
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: 'none'
                                            }}>
                                                <Table sx={{
                                                    '& .MuiTableCell-root': {
                                                        borderBottom: '1px solid #9ca3af'
                                                    }
                                                }}>
                                                    <TableHead sx={{ backgroundColor: '#3b82f6' }}>
                                                        <TableRow>
                                                            <TableCell colSpan={2} sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af', fontSize: '16px' }}>
                                                                聊天摘要
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        <TableRow sx={{
                                                            '&:hover': { backgroundColor: '#f8fafc' }
                                                        }}>
                                                            <TableCell sx={{ color: '#475569' }}>
                                                                {summaryData?.summary || "暫無摘要"}
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#6b7280', fontSize: '14px' }}>
                                                                {summaryData?.date || new Date().toLocaleDateString('zh-TW')}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>

                                        {/* 畫布表格 */}
                                        <Box>
                                            <TableContainer component={Paper} sx={{
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: 'none'
                                            }}>
                                                <Table sx={{
                                                    '& .MuiTableCell-root': {
                                                        borderBottom: '1px solid #9ca3af'
                                                    }
                                                }}>
                                                    <TableHead sx={{ backgroundColor: '#3b82f6' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af', fontSize: '16px' }}>
                                                                畫布紀錄
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        <TableRow sx={{
                                                            '&:hover': { backgroundColor: '#f8fafc' }
                                                        }}>
                                                            <TableCell sx={{ textAlign: 'center', p: 2 }}>
                                                                {selectedChatroom?.canvasImageUrl ? (
                                                                    <img 
                                                                        src={selectedChatroom.canvasImageUrl} 
                                                                        alt="畫布紀錄" 
                                                                        style={{ 
                                                                            width: '100%', 
                                                                            maxWidth: '600px', 
                                                                            height: 'auto',
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #e0e0e0'
                                                                        }} 
                                                                    />
                                                                ) : (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        此聊天室尚無畫布紀錄
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* 詳細情緒分析 */}
                                <Card sx={{
                                    backgroundColor: 'white',
                                    border: '1.5px solid #9ca3af',
                                    borderRadius: 2,
                                    boxShadow: 'none'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 3 }}>
                                            詳細情緒分析
                                        </Typography>

                                        <TableContainer component={Paper} sx={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            boxShadow: 'none'
                                        }}>
                                            <Table sx={{
                                                '& .MuiTableCell-root': {
                                                    borderBottom: '1px solid #9ca3af'
                                                }
                                            }}>
                                                <TableHead sx={{ backgroundColor: '#3b82f6' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af' }}>情緒類型</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af' }}>情緒強度</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af' }}>數值</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {getEmotionList().map((emotion, index) => (
                                                        <TableRow key={index} sx={{
                                                            '&:hover': { backgroundColor: '#f8fafc' }
                                                        }}>
                                                            <TableCell sx={{ color: '#475569', fontWeight: 'bold' }}>
                                                                {emotion.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={(emotion.value / 10) * 100}
                                                                    sx={{
                                                                        height: 8,
                                                                        borderRadius: 3,
                                                                        backgroundColor: '#e5e7eb',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            backgroundColor: getEmotionColor(emotion.name),
                                                                            borderRadius: 3
                                                                        }
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#6b7280', fontSize: '14px' }}>
                                                                {emotion.value.toFixed(1)} / 10.0
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>

                                {/* 需求推測 */}
                                <Card sx={{
                                    backgroundColor: 'white',
                                    border: '1.5px solid #9ca3af',
                                    borderRadius: 2,
                                    boxShadow: 'none'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 3 }}>
                                            需求推測
                                        </Typography>

                                        <TableContainer component={Paper} sx={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            boxShadow: 'none'
                                        }}>
                                            <Table sx={{
                                                '& .MuiTableCell-root': {
                                                    borderBottom: '1px solid #9ca3af'
                                                }
                                            }}>
                                                <TableHead sx={{ backgroundColor: '#3b82f6' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af' }}>需求描述</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af' }}>當時情緒</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: '1px solid #9ca3af' }}>時間</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow sx={{
                                                        '&:hover': { backgroundColor: '#f8fafc' }
                                                    }}>
                                                        <TableCell sx={{ color: '#475569' }}>
                                                            {demandData || "暫無需求分析"}
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
                                        variant="outlined"
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
                                        重新分析聊天室
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary">
                                    請點擊折線圖上的點以查看詳細報表
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default EmotionReportPage;
