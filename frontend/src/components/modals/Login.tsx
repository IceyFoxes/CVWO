import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/userService";
import { TextField, Button } from "@mui/material";
import CustomModal from "../shared/Modal";
import { useAlert } from "../contexts/AlertContext";
import Loader from "../shared/Loader";
import { useAuth } from "../contexts/AuthContext";

interface LoginProps {  
    open: boolean;
    onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ open, onClose }) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginUser(username, password);
            showAlert("Login successful!", "success");
            login(username, data.token);
            navigate("/");
            onClose();
        } catch (error: any) {
            showAlert(error.response?.data?.error || "Unexpected error occurred. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal open={open} onClose={onClose} title="Login">
            <form onSubmit={handleLogin}>
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
                />
                {loading ? (<Loader></Loader>) 
                    : (
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Login
                    </Button>
                )}
            </form>
        </CustomModal>
    );
};

export default Login;

