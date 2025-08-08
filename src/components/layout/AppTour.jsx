import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Box, Paper, Typography, IconButton, LinearProgress } from '@mui/material';
import { ArrowBack, ArrowForward, Close, SkipNext } from '@mui/icons-material';

const AppTour = ({ runTour, setRunTour }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState(null);
  
  const steps = useMemo(() => [
    {
      target: '.app-logo',
      title: '歡迎來到 FeelInk!',
      content: 'FeelInk 是一個融合情感表達與創作分享的智慧平台，透過 AI 技術理解您的情感，協助您創作出富有感情的藝術作品。',
      placement: 'bottom',
    },
    {
      target: '.top-toolbar',
      title: '頂部工具欄',
      content: '包含檔案管理、歷史記錄控制等核心功能，讓您的創作過程更加流暢便利。',
      placement: 'bottom',
    },
    {
      target: '.undo-redo-buttons',
      title: '復原與重做',
      content: '創作過程中的安全網！輕鬆撤銷或重新執行操作，讓您大膽嘗試各種創意想法。',
      placement: 'bottom',
    },
    {
      target: '.file-operations',
      title: '檔案管理',
      content: '完整的創作管理系統：保存您的情感作品、開啟歷史創作、匯入靈感素材，並分享您的藝術成果。',
      placement: 'bottom',
    },
    {
      target: '.canvas-title',
      title: '作品命名',
      content: '為您的情感創作賦予獨特的名稱，每個作品都承載著您當下的心情與故事。',
      placement: 'bottom',
    },
    {
      target: '.chat-toggle',
      title: 'AI 情感助手',
      content: '開啟智慧聊天室，與 AI 分享您的創作靈感和當下情感，獲得個人化的創作建議與情感支持。',
      placement: 'bottom',
    },
    {
      target: '.user-profile',
      title: '個人檔案',
      content: '管理您的創作者身份，查看情感創作歷程，調整個人化的 AI 互動偏好設定。',
      placement: 'bottom',
    },
    {
      target: '.left-toolbar',
      title: '創作工具箱',
      content: '豐富的數位創作工具，從基礎繪圖到進階設計，讓您的情感透過多元方式表達。',
      placement: 'right',
    },
    {
      target: '.tool-buttons',
      title: '多元工具',
      content: '選擇、畫筆、幾何圖形、顏色填充、橡皮擦、文字標註和畫布操作工具。每個工具都能精確調整，滿足您的創作需求。',
      placement: 'right',
    },
    {
      target: '.canvas-area',
      title: '情感畫布',
      content: '您的數位創作空間！支援觸控操作、多點縮放和自由移動。在這裡將內心的情感轉化為視覺藝術。',
      placement: 'left',
    },
    {
      target: '.chat-container',
      title: 'AI 情感聊天室',
      content: '與智慧 AI 助手即時對話，分享創作過程中的想法與情感。AI 會分析您的情緒狀態，提供個人化的創作靈感和情感支持建議。',
      placement: 'left',
    },
  ], []);

  const updateHighlight = useCallback(() => {
    if (!runTour || currentStep >= steps.length) return;

    const targetSelector = steps[currentStep].target;
    const targetElement = document.querySelector(targetSelector);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        placement: steps[currentStep].placement,
      });
    }
  }, [runTour, currentStep, steps]);

  useEffect(() => {
    if (runTour) {
      updateHighlight();
      const handleResize = () => updateHighlight();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [runTour, updateHighlight]);

  useEffect(() => {
    // 延遲 2 秒後自動開啟導覽
    const timer = setTimeout(() => {
      setRunTour(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [setRunTour]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const endTour = () => {
    setRunTour(false);
    setCurrentStep(0);
    setHighlightPosition(null);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const getTooltipStyle = () => {
    if (!highlightPosition) return {};

    const { placement } = highlightPosition;
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    let style = {
      position: 'fixed',
      width: tooltipWidth,
      zIndex: 10002,
    };

    switch (placement) {
      case 'bottom':
        style.top = highlightPosition.top + highlightPosition.height + 15;
        style.left = Math.max(20, Math.min(
          window.innerWidth - tooltipWidth - 20,
          highlightPosition.left + highlightPosition.width / 2 - tooltipWidth / 2
        ));
        break;
      case 'top':
        style.top = highlightPosition.top - tooltipHeight - 15;
        style.left = Math.max(20, Math.min(
          window.innerWidth - tooltipWidth - 20,
          highlightPosition.left + highlightPosition.width / 2 - tooltipWidth / 2
        ));
        break;
      case 'right':
        style.top = Math.max(20, Math.min(
          window.innerHeight - tooltipHeight - 20,
          highlightPosition.top + highlightPosition.height / 2 - tooltipHeight / 2
        ));
        style.left = highlightPosition.left + highlightPosition.width + 15;
        break;
      case 'left':
        style.top = Math.max(20, Math.min(
          window.innerHeight - tooltipHeight - 20,
          highlightPosition.top + highlightPosition.height / 2 - tooltipHeight / 2
        ));
        style.left = highlightPosition.left - tooltipWidth - 15;
        break;
      default:
        style.top = highlightPosition.top + highlightPosition.height + 15;
        style.left = highlightPosition.left;
    }

    return style;
  };

  if (!runTour || !highlightPosition) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* 遮罩層 */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      />
      
      {/* 高亮區域 */}
      <Box
        sx={{
          position: 'absolute',
          top: highlightPosition.top - 4,
          left: highlightPosition.left - 4,
          width: highlightPosition.width + 8,
          height: highlightPosition.height + 8,
          border: '2px solid #2563eb',
          borderRadius: '8px',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          zIndex: 10001,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            },
            '70%': {
              boxShadow: '0 0 0 10px rgba(37, 99, 235, 0), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(37, 99, 235, 0), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            },
          },
        }}
      />

      {/* 提示框 */}
      <Paper
        elevation={8}
        sx={{
          ...getTooltipStyle(),
          padding: '20px',
          borderRadius: '12px',
          maxWidth: '320px',
          zIndex: 10002,
        }}
      >
        {/* 標題欄 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
            {currentStepData.title}
          </Typography>
          <IconButton onClick={endTour} size="small">
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* 內容 */}
        <Typography sx={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, mb: 2 }}>
          {currentStepData.content}
        </Typography>

        {/* 進度條 */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(currentStep + 1) / steps.length * 100}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2563eb',
                borderRadius: 2,
              },
            }}
          />
          <Typography sx={{ fontSize: '12px', color: '#64748b', mt: 1, textAlign: 'center' }}>
            {currentStep + 1} / {steps.length}
          </Typography>
        </Box>

        {/* 操作按鈕 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={endTour}
            variant="text"
            startIcon={<SkipNext />}
            sx={{ color: '#64748b', fontSize: '14px' }}
          >
            跳過導覽
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{ fontSize: '14px' }}
            >
              上一步
            </Button>
            <Button
              onClick={nextStep}
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{
                backgroundColor: '#2563eb',
                fontSize: '14px',
                '&:hover': { backgroundColor: '#1d4ed8' },
              }}
            >
              {currentStep === steps.length - 1 ? '完成' : '下一步'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default AppTour;
