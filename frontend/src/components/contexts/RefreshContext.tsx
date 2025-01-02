import React, { useState, useMemo, ReactNode } from "react";
import { createContextProvider } from "./createContext";

interface RefreshContextProps {
    refreshFlag: boolean;
    triggerRefresh: () => void;
}

const initialRefreshState: RefreshContextProps = {
    refreshFlag: false,
    triggerRefresh: () => {},
};

export const { Context: RefreshContext, useGenericContext: useRefresh } =
    createContextProvider<RefreshContextProps>("RefreshContext", initialRefreshState);

export const RefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [refreshFlag, setRefreshFlag] = useState(false);

    const triggerRefresh = () => setRefreshFlag((prev) => !prev);

    const value = useMemo(() => ({ refreshFlag, triggerRefresh }), [refreshFlag]);

    return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
};
