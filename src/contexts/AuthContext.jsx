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
    
    // 新增：使用者人格設定狀態
    const [hasPersonality, setHasPersonality] = useState(false);
    const [checkingPersonality, setCheckingPersonality] = useState(true);

    const ensureUserChatroom = async (firebaseUser) => {
        try {
            setChatroomLoading(true);
            
            const chatrooms = await getUserChatrooms(firebaseUser.uid);
            
            if (chatrooms && chatrooms.length > 0) {
                setUserChatrooms(chatrooms);
                setCurrentChatroomId(chatrooms[0].chatroomId);
                return;
            }

            // 沒有聊天室時創建新的
            const newChatroom = await createChatroom(
                firebaseUser.uid,
                `${firebaseUser.displayName || firebaseUser.email.split('@')[0]} 的聊天室`
            );
            
            setUserChatrooms([newChatroom]);
            setCurrentChatroomId(newChatroom.chatroomId);
            
        } catch (error) {
            console.error('處理使用者聊天室時發生錯誤:', error);
        } finally {
            setChatroomLoading(false);
        }
    };

    // 新增：檢查使用者是否已設定 AI 人格
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

            // 檢查 preferredAIPartner 欄位（而非 AINickname）
            if (userData && userData.preferredAIPartner && userData.preferredAIPartner.trim() !== "") {
                console.log('資料庫中找到 AI 人格設定:', userData.preferredAIPartner);
                setHasPersonality(true);
                
                // 同步到 localStorage
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

    // 新增：更新使用者人格狀態（供 PersonalitySelectPage 使用）
    const refreshPersonalityStatus = async () => {
        if (user) {
            await checkUserPersonality(user);
        }
    };

    // 創建新聊天室
    const createNewChatroom = async (title) => {
        if (!user) return null;
        try {
            setChatroomLoading(true);
            const newChatroom = await createChatroom(
                user.uid,
                title || `新聊天室 ${new Date().toLocaleString()}`
            );
            setUserChatrooms(prev => [...prev, newChatroom]);
            setCurrentChatroomId(newChatroom.chatroomId);
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