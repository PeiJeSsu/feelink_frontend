// 訊息範本常數
export const PROMPT_TEMPLATES = {
    CONTINUE_CONVERSATION: (messageText) => 
        `使用者回答了: ${messageText} 
        \n請根據這段回覆自然地繼續對話，並試著引導對方多聊一些。可以的話，以問句結尾，讓對話更流暢。請勿重複使用者的回答，應該以新的方式回應。`,
    
    DRAWING_SUGGESTION: (messageText) => 
        `使用者回答了: ${messageText} 
        \n請根據這段回覆自然地繼續對話，並試著引導對方多聊一些。可以的話，以問句結尾，讓對話更流暢。請勿重複使用者的回答，應該以新的方式回應。由於你們已經聊了一會兒，也許可以邀請對方透過一幅簡單的畫來表達當下的感受(像是以要不要話張圖抒發你的感受之類的問句)，但請盡量流暢的銜接問題。`,
    
    SIMPLE_RESPONSE: (messageText) => 
        `${messageText}\n請基於這段訊息提供適當的回應，請勿單純重複此訊息。`
};