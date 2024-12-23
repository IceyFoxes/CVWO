import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
    const [username, setUsername] = useState<string | null>(sessionStorage.getItem("username"));
    const navigate = useNavigate();

    const login = (newUsername: string, token: string) => {
        sessionStorage.setItem("username", newUsername);
        sessionStorage.setItem("jwtToken", token);
        setUsername(newUsername);
    };

    const logout = () => {
        sessionStorage.clear();
        setUsername(null);
        navigate("/login");
    };

    const isLoggedIn = !!username;

    useEffect(() => {
        if (!username) {
            const storedUsername = sessionStorage.getItem("username");
            if (storedUsername) setUsername(storedUsername);
        }
    }, [username]);

    return { username, isLoggedIn, login, logout };
};

export default useAuth;
