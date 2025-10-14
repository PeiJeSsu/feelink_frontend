import { useEffect } from "react";

export const useBeforeunloadBlocker = (isDirty) => {

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.returnValue = '您有未儲存的變更，確定要離開嗎？';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
};
