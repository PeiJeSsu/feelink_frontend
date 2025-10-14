import {useNavigate} from "react-router-dom";

export const useHandleDirtyButtonClick = (isDirty) => {
    const navigate = useNavigate();

    return (target) => {
        if (isDirty) {
            const confirmLeave = window.confirm("您有未儲存的變更，確定要離開嗎？");
            if (!confirmLeave) return;
        }

        if (typeof target === 'string') {
            navigate(target);
        } else if (typeof target === 'function') {
            target();
        } else if (target && typeof target === 'object') {
            const { path, state, replace } = target;
            navigate(path, { state, replace });
        }
    };
};