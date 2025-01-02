import React, { useState, useEffect, useMemo } from "react";
import { createContextProvider } from "./createContext";

interface AuthContextType {
    isLoggedIn: boolean;
    username: string | null;
    login: (username: string, token: string) => void;
    logout: () => void;
}

const initialAuthState: AuthContextType = {
    isLoggedIn: false,
    username: null,
    login: () => {},
    logout: () => {},
};

export const { Context: AuthContext, useGenericContext: useAuth } =
    createContextProvider<AuthContextType>("AuthContext", initialAuthState);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const token = localStorage.getItem("jwtToken");
        if (storedUsername && token) {
            setUsername(storedUsername);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (username: string, token: string) => {
        localStorage.setItem("username", username);
        localStorage.setItem("jwtToken", token);
        setUsername(username);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("jwtToken");
        setUsername(null);
        setIsLoggedIn(false);
    };

    const value = useMemo(
        () => ({ isLoggedIn, username, login, logout }),
        [isLoggedIn, username]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
