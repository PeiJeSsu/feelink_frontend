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
                <Button onClick={onClose} color="inherit">
                    取消
                </Button>
                <Button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    variant="contained"
                    color="primary"
                >
                    確定
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaveCanvasDialog;
