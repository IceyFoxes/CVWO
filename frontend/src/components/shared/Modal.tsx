import React from "react";
import { Modal, Box, Typography } from "@mui/material";
import { DangerButton, PrimaryButton } from "./Buttons";

interface ModalProps {
    open: boolean;
    title: string;
    content?: string;
    children?: React.ReactNode; 
    onClose: () => void;
    onConfirm?: () => void;
}

const CustomModal: React.FC<ModalProps> = ({ open, title, content, children, onClose, onConfirm }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: "90%", sm: "75%", md: "50%" }, 
                    maxWidth: "500px", 
                    margin: "auto",
                    marginTop: { xs: "10%", sm: "5%" }, 
                    padding: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 24,
                    outline: "none",
                }}
            >
                <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    {title}
                </Typography>
                {content && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {content}
                    </Typography>
                )}
                {children} {/* Render children here */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        mt: 3,
                    }}
                >
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
