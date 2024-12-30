import React from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface CustomAlertProps {
    open: boolean;
    message: string;
    severity: AlertColor; // "success" | "error" | "warning" | "info"
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ open, message, severity, onClose }) => {
    return (
        <Snackbar open={open} onClose={onClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert onClose={onClose} severity={severity} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    );
};

export default CustomAlert;
