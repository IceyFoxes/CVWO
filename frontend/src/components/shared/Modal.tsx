import React from "react";
import { Modal, Box, Typography } from "@mui/material";
import { DangerButton, PrimaryButton } from "./Buttons";

interface ModalProps {
    open: boolean;
    title: string;
    content?: string; // Optional for cases where content is handled through children
    children?: React.ReactNode; // Add this line to include children support
    onClose: () => void;
    onConfirm?: () => void;
}

const CustomModal: React.FC<ModalProps> = ({ open, title, content, children, onClose, onConfirm }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    width: 400,
                    margin: "100px auto",
                    padding: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                }}
            >
                <Typography variant="h6">{title}</Typography>
                {content && (
                    <Typography variant="body2" sx={{ my: 2 }}>
                        {content}
                    </Typography>
                )}
                {children} {/* Render children here */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <DangerButton onClick={onClose}>
                        Cancel
                    </DangerButton>
                    {onConfirm && (
                        <PrimaryButton onClick={onConfirm}>
                            Confirm
                        </PrimaryButton>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default CustomModal;

