import React, { useState, ReactNode, useMemo } from "react";
import { createContextProvider } from "./createContext";
import CustomAlert from "../shared/Alert";

type AlertSeverity = "success" | "error" | "info" | "warning";

interface AlertContextProps {
    showAlert: (message: string, severity: AlertSeverity) => void;
}

const initialAlertState: AlertContextProps = {
    showAlert: () => {}, // Placeholder function
};

export const { Context: AlertContext, useGenericContext: useAlert } =
    createContextProvider<AlertContextProps>("AlertContext", initialAlertState);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("info");

    const showAlert = (message: string, severity: AlertSeverity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
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
                severity={alertSeverity}
                onClose={handleClose}
            />
        </AlertContext.Provider>
    );
};
