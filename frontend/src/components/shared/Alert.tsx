import React from "react";
import { Snackbar, Alert, AlertColor, Slide, Typography } from "@mui/material";

interface CustomAlertProps {
    open: boolean;
    message: string;
    severity: AlertColor; // "success" | "error" | "warning" | "info"
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ open, message, severity, onClose }) => {
    return (
        <Snackbar
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical:"top", horizontal:"center" }}
            autoHideDuration={3000} 
            TransitionComponent={(props) => <Slide {...props} direction="down" />}
            sx={{
                "& .MuiSnackbarContent-root": {
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
                    borderRadius: "8px", 
                },
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{
                    borderRadius: "8px", 
                    padding: "8px 16px", 
                    backgroundColor: severity === "error" ? "#d32f2f" : undefined, // Custom error color
                }}
            >
                <Typography
                    sx={{
                        fontFamily: "Montserrat"
                    }}
                >
                    {message}
                </Typography>
            </Alert>
        </Snackbar>
    );
};

export default CustomAlert;
