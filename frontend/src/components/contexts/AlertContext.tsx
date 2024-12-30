import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import CustomAlert from "../shared/Alert";

type AlertSeverity = "success" | "error" | "info" | "warning";

interface AlertContextProps {
    showAlert: (message: string, severity: AlertSeverity) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info" | "warning">("info");

    const showAlert = (message: string, severity: "success" | "error" | "info" | "warning") => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };

    const handleClose = () => {
        setAlertOpen(false);
    };

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

export const useAlert = (): AlertContextProps => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return context;
};
