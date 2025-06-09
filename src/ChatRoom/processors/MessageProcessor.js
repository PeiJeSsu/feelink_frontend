import { PROMPT_TEMPLATES } from "../constants/PromptTemplates";

// 根據對話次數選擇適當的訊息模板  
export const getFullMessage = (messageText, conversationCount, defaultQuestion) => {
    if (conversationCount === 3) {
        return PROMPT_TEMPLATES.DRAWING_SUGGESTION(messageText);
    } else if (defaultQuestion) {
        return PROMPT_TEMPLATES.CONTINUE_CONVERSATION(messageText);
    } else {
        return PROMPT_TEMPLATES.SIMPLE_RESPONSE(messageText);
    }
};

