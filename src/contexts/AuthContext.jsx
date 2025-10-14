import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import {createChatroom, deleteChatroom as deleteChatroomAPI, updateChatroomTitle as updateChatroomTitleAPI , getUserChatrooms} from "../ChatRoom/helpers/MessageAPI";
import UserService from "../helpers/personality/UserService";
 
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [userChatrooms, setUserChatrooms] = useState([]);
    const [currentChatroomId, setCurrentChatroomId] = useState(null);
    const [chatroomLoading, setChatroomLoading] = useState(false);
    const [chatroomMessagesCache, setChatroomMessagesCache] = useState({});
    const [chatroomRefreshTrigger, setChatroomRefreshTrigger] = useState(0);
    const [hasPersonality, setHasPersonality] = useState(false);
    const [checkingPersonality, setCheckingPersonality] = useState(true);

    const updateCurrentChatroomPartner = (chatroomId) => {
    if (!chatroomId || !userChatrooms || userChatrooms.length === 0) {
        return;
    }

    const currentChatroom = userChatrooms.find(room => room.chatroomId === chatroomId);
    
        if (currentChatroom && currentChatroom.aiPartner) {
            const partnerNameMap = {
                'MUSE': '謬思',
                'QIQI': '奇奇',
                'NUANNUAN': '暖暖'
            };

            // AI Partner enum 值轉換為英文名稱
            const partnerEnglishMap = {
                'MUSE': 'Muse',
                'QIQI': 'QiQi',
                'NUANNUAN': 'NuanNuan'
            };

            // AI Partner enum 值轉換為人格 ID
            const personalityMap = {
                'MUSE': 'creative',
                'QIQI': 'curious',
                'NUANNUAN': 'warm'
            };

            const aiPartnerValue = currentChatroom.aiPartner;
            const chineseName = partnerNameMap[aiPartnerValue] || aiPartnerValue;
            const englishName = partnerEnglishMap[aiPartnerValue] || aiPartnerValue;
            const personalityId = personalityMap[aiPartnerValue];

            localStorage.setItem('currentChatroomAIPartnerName', chineseName); 
            localStorage.setItem('currentChatroomAIPartnerEnglish', englishName);
            
            // 根據聊天室的 AI 夥伴設定對應的人格
            if (personalityId) {
                localStorage.setItem('selectedPersonality', personalityId);
            }

            console.log('已更新當前聊天室 AI 夥伴到 localStorage:', {
                chineseName: chineseName,
                englishName: englishName,
                personalityId: personalityId
            });
        }
    };

    const ensureUserChatroom = async (firebaseUser) => {
        try {
            setChatroomLoading(true);
            
            const chatrooms = await getUserChatrooms(firebaseUser.uid);
            
            if (chatrooms && chatrooms.length > 0) {
                setUserChatrooms(chatrooms);
                const firstChatroomId = chatrooms[0].chatroomId;
                setCurrentChatroomId(firstChatroomId);
                
                updateCurrentChatroomPartner(firstChatroomId);
                return;
            }

            // 沒有聊天室時創建新的
            // 獲取使用者的預設 AI 夥伴
            let defaultPartner = 'MUSE'; 
            const aiPartnerName = localStorage.getItem('aiPartnerName');
            if (aiPartnerName) {
                const partnerMap = {
                    '謬思': 'MUSE',
                    '奇奇': 'QIQI',
                    '暖暖': 'NUANNUAN'
                };
                defaultPartner = partnerMap[aiPartnerName] || 'MUSE';
            }

            const newChatroom = await createChatroom(
                firebaseUser.uid,
                `${firebaseUser.displayName || firebaseUser.email.split('@')[0]} 的聊天室`,
                defaultPartner 
            );
            
            setUserChatrooms([newChatroom]);
            setCurrentChatroomId(newChatroom.chatroomId);
            
            // 更新新建聊天室的 AI 夥伴到 localStorage
            setTimeout(() => {
                updateCurrentChatroomPartner(newChatroom.chatroomId);
            }, 100);
            
        } catch (error) {
            console.error('處理使用者聊天室時發生錯誤:', error);
        } finally {
            setChatroomLoading(false);
        }
    };

    const checkUserPersonality = async (firebaseUser) => {
        if (!firebaseUser) {
            setHasPersonality(false);
            setCheckingPersonality(false);
            return;
        }

        try {
            console.log('正在從資料庫檢查使用者是否已設定 AI 人格...');
            setCheckingPersonality(true);
            
            const userData = await UserService.getUserByEmail(firebaseUser.email);

            if (userData && userData.preferredAIPartner && userData.preferredAIPartner.trim() !== "") {
                console.log('資料庫中找到 AI 人格設定:', userData.preferredAIPartner);
                setHasPersonality(true);
                
                const personalityMap = {
                    'MUSE': 'creative',
                    'QIQI': 'curious',
                    'NUANNUAN': 'warm'
                };
                const personalityId = personalityMap[userData.preferredAIPartner];
                if (personalityId) {
                    localStorage.setItem('selectedPersonality', personalityId);
                }
                
                if (userData.AINickname) {
                    localStorage.setItem('aiPartnerName', userData.AINickname);
                }
                if (userData.nickname) {
                    localStorage.setItem('userNickname', userData.nickname);
                }
            } else {
                console.log('資料庫中未找到 AI 人格設定');
                setHasPersonality(false);
            }
        } catch (error) {
            console.error("從資料庫檢查使用者人格設定失敗:", error);
            setHasPersonality(false);
        } finally {
            setCheckingPersonality(false);
        }
    };

    const refreshPersonalityStatus = async () => {
        if (user) {
            await checkUserPersonality(user);
        }
    };

    // 創建新聊天室
    const createNewChatroom = async (title, aiPartner) => {
        if (!user) return null;
        try {
            setChatroomLoading(true);
            
            let partnerToUse = aiPartner;
            
            if (!partnerToUse) {
                const aiPartnerName = localStorage.getItem('aiPartnerName');
                const partnerMap = {
                    '謬思': 'MUSE',
                    '奇奇': 'QIQI',
                    '暖暖': 'NUANNUAN'
                };
                partnerToUse = partnerMap[aiPartnerName] || 'MUSE'; 
            }
            
            const newChatroom = await createChatroom(
                user.uid,
                title || `新聊天室 ${new Date().toLocaleString()}`,
                partnerToUse  
            );
            
            setUserChatrooms(prev => [...prev, newChatroom]);
            setCurrentChatroomId(newChatroom.chatroomId);
            
            // 創建新聊天室後更新 localStorage
            setTimeout(() => {
                updateCurrentChatroomPartner(newChatroom.chatroomId);
            }, 100);
            
            return newChatroom;
        } catch (error) {
            console.error('創建聊天室失敗:', error);
            return null;
        } finally {
            setChatroomLoading(false);
        }
    };

    const handleDeleteChatroom = async (chatroomId) => {
        try {
            setChatroomLoading(true);
            await deleteChatroomAPI(chatroomId);
            setUserChatrooms(prev => prev.filter(room => room.chatroomId !== chatroomId));
            clearChatroomCache(chatroomId);
            
            if (chatroomId === currentChatroomId) {
                const remaining = userChatrooms.filter(room => room.chatroomId !== chatroomId);
                if (remaining.length > 0) {
                    setCurrentChatroomId(remaining[0].chatroomId);
                    // 刪除當前聊天室後，更新到下一個聊天室的 AI 夥伴
                    updateCurrentChatroomPartner(remaining[0].chatroomId);
                } else {
                    await createNewChatroom();
                }
            }
        } catch (error) {
            console.error('刪除聊天室失敗:', error);
            throw error;
        } finally {
            setChatroomLoading(false);
        }
    };

    const handleUpdateChatroomTitle = async (chatroomId, newTitle) => {
        try {
            await updateChatroomTitleAPI(chatroomId, newTitle);
            setUserChatrooms(prev => 
                prev.map(room => 
                    room.chatroomId === chatroomId 
                        ? { ...room, title: newTitle }
                        : room
                )
            );
        } catch (error) {
            console.error('更新聊天室標題失敗:', error);
            throw error;
        }
    };

    const switchChatroom = (chatroomId) => {
        if (chatroomId === currentChatroomId) {
            console.log('已在當前聊天室，無需切換:', chatroomId);
            return;
        }
        
        setCurrentChatroomId(chatroomId);
        
        // 切換聊天室時更新 AI 夥伴到 localStorage
        updateCurrentChatroomPartner(chatroomId);
    };

    const forceReloadChatroom = (chatroomId = currentChatroomId) => {
        if (!chatroomId) return;
        
        setChatroomMessagesCache(prev => {
            const newCache = { ...prev };
            delete newCache[chatroomId];
            return newCache;
        });
        
        setChatroomRefreshTrigger(prev => prev + 1);
    };

    const updateChatroomCache = (chatroomId, messages) => {
        if (!chatroomId || !messages) return;
        setChatroomMessagesCache(prev => ({
            ...prev,
            [chatroomId]: {
                messages,
                timestamp: Date.now()
            }
        }));
    };

    const getChatroomCache = (chatroomId) => {
        return chatroomMessagesCache[chatroomId];
    };

    const clearChatroomCache = (chatroomId) => {
        setChatroomMessagesCache(prev => {
            const newCache = { ...prev };
            delete newCache[chatroomId];
            return newCache;
        });
    };

    const reloadCurrentChatroom = () => {
        forceReloadChatroom();
    };

    // 監聽 userChatrooms 的變化，確保在資料載入後更新 localStorage
    useEffect(() => {
        if (currentChatroomId && userChatrooms.length > 0) {
            updateCurrentChatroomPartner(currentChatroomId);
        }
    }, [userChatrooms, currentChatroomId]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user ? `使用者登入: ${user.uid}` : '使用者登出');
            
            if (user) {
                console.log('使用者登入，正在檢查聊天室...');
                await ensureUserChatroom(user);
                console.log('聊天室檢查完成');
                
                // 檢查使用者人格設定
                await checkUserPersonality(user);
            } else {
                console.log('清空聊天室資訊');
                setUserChatrooms([]);
                setCurrentChatroomId(null);
                setChatroomLoading(false);
                setChatroomMessagesCache({});
                setHasPersonality(false);
                setCheckingPersonality(false);
            }
            
            setUser(user);
            setInitializing(false);
        });

        return unsubscribe; 
    }, []);

    const logout = async () => {
        try {
            console.log('準備登出...');
            setCurrentChatroomId(null);
            setUserChatrooms([]);
            setChatroomLoading(false);
            setChatroomMessagesCache({});
            setHasPersonality(false);
            
            localStorage.removeItem('selectedPersonality');
            localStorage.removeItem('currentSessionId');
            localStorage.removeItem('aiPartnerName');
            localStorage.removeItem('userNickname');
            localStorage.removeItem('currentChatroomAIPartner');
            localStorage.removeItem('currentChatroomAIPartnerName');
            localStorage.removeItem('currentChatroomAIPartnerEnglish');
            
            await signOut(auth);
            console.log('登出完成');
        } catch (error) {
            console.error("登出錯誤:", error);
            throw error;
        }
    };

    const value = {
        user,
        initializing,
        userChatrooms,
        currentChatroomId,
        chatroomLoading,
        chatroomRefreshTrigger,
        hasPersonality,
        checkingPersonality,
        refreshPersonalityStatus,
        createNewChatroom,
        deleteChatroom: handleDeleteChatroom, 
        updateChatroomTitle: handleUpdateChatroomTitle, 
        switchChatroom,
        forceReloadChatroom,
        reloadCurrentChatroom, 
        updateChatroomCache,
        getChatroomCache,
        clearChatroomCache,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};