import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import {createChatroom, deleteChatroom as deleteChatroomAPI, updateChatroomTitle as updateChatroomTitleAPI , getUserChatrooms} from "../ChatRoom/helpers/MessageAPI";
 
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [userChatrooms, setUserChatrooms] = useState([]);
    const [currentChatroomId, setCurrentChatroomId] = useState(null);
    const [chatroomLoading, setChatroomLoading] = useState(false);
    const [chatroomMessagesCache, setChatroomMessagesCache] = useState({});
    const [chatroomRefreshTrigger, setChatroomRefreshTrigger] = useState(0);

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
            // 使用重命名後的 API 函數
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
            // 使用重命名後的 API 函數
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
        // 移除強制重新載入的邏輯
    };

    const forceReloadChatroom = (chatroomId = currentChatroomId) => {
        if (!chatroomId) return;
        
        // 清除該聊天室的快取
        setChatroomMessagesCache(prev => {
            const newCache = { ...prev };
            delete newCache[chatroomId];
            return newCache;
        });
        
        // 觸發重新載入
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
            console.log('Auth state changed:', user ? `用戶登入: ${user.uid}` : '用戶登出');
            
            if (user) {
                console.log('使用者登入，正在檢查聊天室...');
                await ensureUserChatroom(user);
                console.log('聊天室檢查完成');
            } else {
                console.log('清空聊天室資訊');
                setUserChatrooms([]);
                setCurrentChatroomId(null);
                setChatroomLoading(false);
                setChatroomMessagesCache({});
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
            
            localStorage.removeItem('selectedPersonality');
            localStorage.removeItem('currentSessionId');
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