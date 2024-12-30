import React, { createContext, useState, useContext, useEffect, useMemo } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    username: string | null;
    login: (username: string, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const storedUsername = sessionStorage.getItem("username");
        const token = sessionStorage.getItem("jwtToken");
        if (storedUsername && token) {
            setUsername(storedUsername);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (username: string, token: string) => {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("jwtToken", token);
        setUsername(username);
        setIsLoggedIn(true);
    };

    const logout = () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("jwtToken");
        setUsername(null);
        setIsLoggedIn(false);
    };

    const value = useMemo(
        () => ({ isLoggedIn, username, login, logout }),
        [isLoggedIn, username]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
