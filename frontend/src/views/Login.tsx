import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/userService";

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const message = location.state?.message || null;
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await loginUser(username);
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("jwtToken", data.token);
            navigate("/");
        } catch (error: any) {
            setError(error.response?.data?.error || "Unexpected error occurred. Please try again.");
        }
    };

    return (
        <div>
            {message && <p style={{ color: "red" }}>{message}</p>}
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
