import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


const resources = {
  'zh-TW': {
    translation: {
      personalSettings: {
        title: '個人設置',
        subtitle: '設定您的基本資訊，並選擇最適合您的 AI 創作夥伴',
        basicSettings: '基本設定',
        nickname: '使用者暱稱',
        nicknamePlaceholder: '請輸入您的暱稱',
        language: '偏好語言',
        languageOptions: {
          'zh-TW': '繁體中文 (Traditional Chinese)',
          'en-US': '英文 (English)'
        },
        aiPartnerSection: {
          title: '選擇您的 AI 創作夥伴',
          subtitle: '每位 AI 夥伴都有獨特的個性和專長，將陪伴您的創作旅程',
          features: '特色功能：'
        },
        personalities: {
          creative: {
            name: '創意夥伴 — 謬思',
            description: '充滿創意靈感的藝術夥伴，提供意想不到的創作建議，鼓勵突破常規的表達方式',
            features: [
              '提供創意靈感',
              '跨領域連結',
              '鼓勵實驗性表達',
              '突破常規思維'
            ]
          },
          curious: {
            name: '好奇分析師 — 奇奇',
            description: '充滿好奇心的藝術分析師，深入探討創作背後的心理',
            features: [
              '深度分析探討',
              '提供專業見解',
              '引導性問句',
              '分享藝術理論'
            ]
          },
          warm: {
            name: '溫暖導師 — 暖暖',
            description: '溫暖關懷的繪畫導師，提供鼓勵和支持，創造安全的表達環境',
            features: [
              '溫暖鼓勵回饋',
              '創造安全環境',
              '循序漸進指導',
              '同理心回應'
            ]
          }
        },
        startButton: '開始創作旅程',
        validationMessage: '請完成暱稱設定並選擇 AI 夥伴'
      }
    }
  },
  'en-US': {
    translation: {
      personalSettings: {
        title: 'Personal Settings',
        subtitle: 'Set up your basic information and choose the AI creative partner that best suits you',
        basicSettings: 'Basic Settings',
        nickname: 'User Nickname',
        nicknamePlaceholder: 'Please enter your nickname',
        language: 'Preferred Language',
        languageOptions: {
          'zh-TW': '繁體中文 (Traditional Chinese)',
          'en-US': '英文 (English)'
        },
        aiPartnerSection: {
          title: 'Choose Your AI Creative Partner',
          subtitle: 'Each AI partner has a unique personality and expertise to accompany your creative journey',
          features: 'Key Features:'
        },
        personalities: {
          creative: {
            name: 'Creative Partner — Muse',
            description: 'An artistic partner full of creative inspiration, providing unexpected creative suggestions and encouraging unconventional expression',
            features: [
              'Provide creative inspiration',
              'Cross-domain connections',
              'Encourage experimental expression',
              'Break conventional thinking'
            ]
          },
          curious: {
            name: 'Curious Analyst — QiQi',
            description: 'A curious art analyst who deeply explores the psychology behind creation',
            features: [
              'In-depth analysis and exploration',
              'Provide professional insights',
              'Guiding questions',
              'Share art theory'
            ]
          },
          warm: {
            name: 'Warm Mentor — NuanNuan',
            description: 'A warm and caring painting mentor who provides encouragement and support, creating a safe environment for expression',
            features: [
              'Warm encouraging feedback',
              'Create safe environment',
              'Step-by-step guidance',
              'Empathetic responses'
            ]
          }
        },
        startButton: 'Start Creative Journey',
        validationMessage: 'Please complete nickname setup and select an AI partner'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-TW', 
    fallbackLng: 'zh-TW',
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;