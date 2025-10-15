import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

const SaveCanvasDialog = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>儲存畫布</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    是否確定要儲存畫布？
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    sx={{
                        color: "#2563eb",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #2563eb",
                        fontSize: "14px",
                        fontWeight: 500,
                        padding: "6px 12px",
                        borderRadius: "8px",
                        textTransform: "none",
                        height: "36px",
                        fontFamily: '"Inter", "Noto Sans TC", sans-serif',
                        "&:hover": {
                            backgroundColor: "#f1f5f9",
                            color: "#2563eb",
                            border: "none",
                        }
                    }}>
                    取消
                </Button>
                <Button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    sx={{
                        color: "#2563eb",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #2563eb",
                        fontSize: "14px",
                        fontWeight: 500,
                        padding: "6px 12px",
                        borderRadius: "8px",
                        textTransform: "none",
                        height: "36px",
                        fontFamily: '"Inter", "Noto Sans TC", sans-serif',
                        "&:hover": {
                            backgroundColor: "#f1f5f9",
                            color: "#2563eb",
                            border: "none",
                        }
                    }}
                >
                    確定
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaveCanvasDialog;
