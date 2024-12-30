import React, { createContext, useContext, useState, useMemo } from "react";

interface RefreshContextProps {
    refreshFlag: boolean;
    triggerRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextProps | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refreshFlag, setRefreshFlag] = useState(false);

    const triggerRefresh = () => {
        setRefreshFlag((prev) => !prev);
    };

    const value = useMemo(
        () => ({ refreshFlag, triggerRefresh }),
        [refreshFlag]
    );

    return (
        <RefreshContext.Provider value={value}>
            {children}
        </RefreshContext.Provider>
    );
};

export const useRefresh = (): RefreshContextProps => {
    const context = useContext(RefreshContext);
    if (!context) {
        throw new Error("useRefresh must be used within a RefreshProvider");
    }
    return context;
};
