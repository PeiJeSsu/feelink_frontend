import { createContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { apiConfig } from "../ChatRoom/config/ApiConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [userChatrooms, setUserChatrooms] = useState([]);
    const [currentChatroomId, setCurrentChatroomId] = useState(null);
    const [chatroomLoading, setChatroomLoading] = useState(false);

    const ensureUserChatroom = async (firebaseUser) => {
        try {
            setChatroomLoading(true);
            console.log('開始為用戶檢查/創建聊天室:', firebaseUser.uid);

            // 使用 apiConfig 進行 API 調用
            const checkResponse = await apiConfig.get(`/api/chatrooms/user/${firebaseUser.uid}`);

            if (checkResponse.data && checkResponse.data.length > 0) {
                console.log('使用者已有聊天室:', checkResponse.data);
                setUserChatrooms(checkResponse.data);
                
                const firstChatroomId = checkResponse.data[0].chatroomId;
                console.log('設置當前聊天室 ID:', firstChatroomId);
                setCurrentChatroomId(firstChatroomId);
                return;
            }

            // 2. 如果沒有聊天室，創建新的
            console.log('用戶沒有聊天室，正在創建新的...');
            const createData = {
                userId: firebaseUser.uid,
                title: `${firebaseUser.displayName || firebaseUser.email.split('@')[0]} 的聊天室`
            };

            const createResponse = await apiConfig.post('/api/chatrooms', createData);

            const newChatroom = createResponse.data;
            console.log('為使用者創建新聊天室:', newChatroom);
            setUserChatrooms([newChatroom]);
            
            const newChatroomId = newChatroom.chatroomId;
            console.log('設置新聊天室 ID:', newChatroomId);
            setCurrentChatroomId(newChatroomId);

        } catch (error) {
            console.error('處理用戶聊天室時發生錯誤:', error);
            // 如果是 404 錯誤（用戶沒有聊天室），則創建新的
            if (error.response?.status === 404) {
                try {
                    const createData = {
                        userId: firebaseUser.uid,
                        title: `${firebaseUser.displayName || firebaseUser.email.split('@')[0]} 的聊天室`
                    };

                    const createResponse = await apiConfig.post('/api/chatrooms', createData);
                    const newChatroom = createResponse.data;
                    console.log('為使用者創建新聊天室:', newChatroom);
                    setUserChatrooms([newChatroom]);
                    
                    const newChatroomId = newChatroom.chatroomId;
                    console.log('設置新聊天室 ID:', newChatroomId);
                    setCurrentChatroomId(newChatroomId);
                } catch (createError) {
                    console.error('創建聊天室失敗:', createError);
                }
            }
        } finally {
            setChatroomLoading(false);
        }
    };

    // 創建新聊天室
    const createNewChatroom = async (title) => {
        if (!user) {
            console.error('用戶未登入，無法創建聊天室');
            return null;
        }

        try {
            setChatroomLoading(true);
            const createData = {
                userId: user.uid,
                title: title || `新聊天室 ${new Date().toLocaleString()}`
            };

            const response = await apiConfig.post('/api/chatrooms', createData);

            const newChatroom = response.data;
            setUserChatrooms(prev => [...prev, newChatroom]);
            
            const newChatroomId = newChatroom.chatroomId;
            console.log('創建並設置新聊天室 ID:', newChatroomId);
            setCurrentChatroomId(newChatroomId);
            
            return newChatroom;
        } catch (error) {
            console.error('創建聊天室時發生錯誤:', error);
            return null;
        } finally {
            setChatroomLoading(false);
        }
    };

    // 🎯 改善：切換聊天室函數
    const switchChatroom = (chatroomId) => {
        if (chatroomId === currentChatroomId) {
            console.log('已在當前聊天室，無需切換:', chatroomId);
            return;
        }
        
        console.log('切換聊天室:', currentChatroomId, '->', chatroomId);
        setCurrentChatroomId(chatroomId);
    };

    // 🎯 新增：手動重新載入當前聊天室
    const reloadCurrentChatroom = () => {
        if (currentChatroomId) {
            console.log('重新載入當前聊天室:', currentChatroomId);
            // 觸發聊天室內容重新載入，但不改變 currentChatroomId
            // 這將由 useChatMessages 的 reloadChatroomHistory 函數處理
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user ? `用戶登入: ${user.uid}` : '用戶登出');
            
            if (user) {
                console.log('用戶登入，正在檢查聊天室...');
                await ensureUserChatroom(user);
                console.log('聊天室檢查完成');
            } else {
                console.log('清空聊天室資訊');
                setUserChatrooms([]);
                setCurrentChatroomId(null);
                setChatroomLoading(false);
            }
            
            setUser(user);
            setInitializing(false);
        });

        return unsubscribe; 
    }, []);

    const logout = async () => {
        try {
            // 🎯 改善：登出時清理狀態
            console.log('準備登出...');
            setCurrentChatroomId(null);
            setUserChatrooms([]);
            setChatroomLoading(false);
            
            localStorage.removeItem('selectedPersonality');
            localStorage.removeItem('currentSessionId');
            await signOut(auth);
            console.log('登出完成');
        } catch (error) {
            console.error("登出錯誤:", error);
            throw error;
        }
    };

    // 調試信息
    useEffect(() => {
        console.log('AuthContext State Update:', {
            user: user ? user.uid : null,
            currentChatroomId,
            userChatrooms: userChatrooms.length,
            initializing,
            chatroomLoading
        });
    }, [user, currentChatroomId, userChatrooms, initializing, chatroomLoading]);

    const value = useMemo(
        () => ({
            user,
            initializing,
            userChatrooms,
            currentChatroomId,
            chatroomLoading,
            createNewChatroom,
            switchChatroom,
            reloadCurrentChatroom, // 🎯 新增：重新載入當前聊天室
            logout,
        }),
        [user, initializing, userChatrooms, currentChatroomId, chatroomLoading]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};