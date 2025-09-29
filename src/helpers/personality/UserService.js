// services/UserService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class UserService {
    constructor() {
        this.api = axios.create({
            baseURL: `${API_BASE_URL}/api/users`,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // 同步用戶資料到後端
    async syncUser(userData) {
        try {
            const response = await this.api.post('/sync', userData);
            return response.data;
        } catch (error) {
            console.error('同步用戶資料失敗:', error);
            throw new Error('無法同步用戶資料，請稍後再試');
        }
    }

    // 根據email獲取用戶資料
    async getUserByEmail(email) {
        try {
            const response = await this.api.get(`/email/${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null; // 用戶不存在
            }
            console.error('根據email獲取用戶資料失敗:', error);
            throw new Error('無法根據email獲取用戶資料');
        }
    }

    // 更新用戶資料
    async updateUser(userId, userData) {
        try {
            const response = await this.api.put(`/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error('更新用戶資料失敗:', error);
            throw new Error('無法更新用戶資料');
        }
    }

    // 將前端的個性ID對應到後端的AIPartner枚舉
    mapPersonalityToAIPartner(personalityId) {
        const personalityMap = {
            'creative': 'MUSE',
            'curious': 'QIQI', 
            'warm': 'NUANNUAN'
        };
        return personalityMap[personalityId] || null;
    }

    // 取得AI夥伴的顯示名稱
    getAIPartnerDisplayName(personalityId, language = 'zh-TW') {
        const nameMap = {
            'zh-TW': {
                'creative': '謬思',
                'curious': '奇奇', 
                'warm': '暖暖'
            },
            'en-US': {
                'creative': 'Muse',
                'curious': 'QiQi',
                'warm': 'NuanNuan'
            }
        };
        
        const names = nameMap[language] || nameMap['zh-TW'];
        return names[personalityId] || 'AI夥伴';
    }
}

const userService = new UserService();
export default userService;