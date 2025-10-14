import { useEffect, useRef, useState } from "react";

export const useCanvasDirty = (canvasRef, intervalMs = 500) => {
    const [isDirty, setIsDirty] = useState(false);
    const lastSnapshotRef = useRef("");

    useEffect(() => {
        console.log("isDirty 狀態變化:", isDirty);
    }, [isDirty]);


    useEffect(() => {
        if (!canvasRef.current) return;

        const checkDirty = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const snapshot = canvas.toJSON();
            const snapshotStr = JSON.stringify(snapshot);

            if (lastSnapshotRef.current && lastSnapshotRef.current !== snapshotStr) {
                setIsDirty(true);
            }

            lastSnapshotRef.current = snapshotStr;
        };

        const intervalId = setInterval(checkDirty, intervalMs);

        return () => clearInterval(intervalId);
    }, [canvasRef, intervalMs]);

    const resetDirty = () => {
        setTimeout(() => {
            setIsDirty(false);
        }, 1000);
    }

    return { isDirty, resetDirty, setIsDirty };
};
