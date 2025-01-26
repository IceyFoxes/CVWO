import React, { useState, ReactNode, useMemo } from "react";
import { createContextProvider } from "./createContext";
import CustomAlert from "../shared/Alert";
import { AlertColor } from "@mui/material";

interface AlertContextProps {
    showAlert: (message: string, severity: AlertColor) => void;
}

const initialAlertState: AlertContextProps = {
    showAlert: () => {}, // Placeholder function
};

export const { Context: AlertContext, useGenericContext: useAlert } =
    createContextProvider<AlertContextProps>("AlertContext", initialAlertState);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertColor, setAlertColor] = useState<AlertColor>("info");

    const showAlert = (message: string, severity: AlertColor) => {
        setAlertMessage(message);
        setAlertColor(severity);
        setAlertOpen(true);
    };

    const handleClose = () => setAlertOpen(false);

    const value = useMemo(() => ({ showAlert }), []);

    return (
        <AlertContext.Provider value={value}>
            {children}
            <CustomAlert
                open={alertOpen}
                message={alertMessage}
                severity={alertColor}
                onClose={handleClose}
            />
        </AlertContext.Provider>
    );
};
