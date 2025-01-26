import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createContextProvider } from "./createContext";
import { jwtDecode } from "jwt-decode";

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

    const logout = useCallback(() => {
        localStorage.removeItem("username");
        localStorage.removeItem("jwtToken");
        setUsername(null);
        setIsLoggedIn(false);
    }, []);

    const handleTokenExpiry = useCallback(
        (token: string): boolean => {
            try {
                const { exp } = jwtDecode<{ exp: number }>(token);
                const expirationTime = exp * 1000 - Date.now(); // Calculate time remaining in milliseconds

                if (expirationTime > 0) {
                    setTimeout(() => {
                        logout();
                    }, expirationTime);
                    return true;
                } else {
                    logout();
                    return false;
                }
            } catch {
                logout();
                return false;
            }
        },
        [logout]
    );

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const token = localStorage.getItem("jwtToken");

        if (storedUsername && token) {
            if (handleTokenExpiry(token)) {
                setUsername(storedUsername);
                setIsLoggedIn(true);
            }
        }
    }, [handleTokenExpiry]);

    const login = useCallback(
        (username: string, token: string) => {
            if (handleTokenExpiry(token)) {
                localStorage.setItem("username", username);
                localStorage.setItem("jwtToken", token);
                setUsername(username);
                setIsLoggedIn(true);
            } else {
                console.error("Attempted login with an invalid or expired token.");
            }
        },
        [handleTokenExpiry]
    );

    const value = useMemo(
        () => ({ isLoggedIn, username, login, logout }),
        [isLoggedIn, username, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
