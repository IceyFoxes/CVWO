import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/userService";
import { TextField } from "@mui/material";
import CustomModal from "../shared/Modal";
import { useAlert } from "../contexts/AlertContext";
import Loader from "../shared/Loader";
import { PrimaryButton } from "../shared/Buttons";
import { useAuth } from "../contexts/AuthContext";

interface RegisterProps {
    open: boolean;
    onClose: () => void;
}

const Register: React.FC<RegisterProps> = ({ open, onClose }) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { login } = useAuth();

    const validateInput = (): boolean => {
        if (!username.trim() || username.length < 3) {
            showAlert("Username must be at least 3 characters long.", "warning");
            return false;
        }
        if (!password.trim() || password.length < 6) {
            showAlert("Password must be at least 6 characters long.", "warning");
            return false;
        }
        return true;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateInput()) return;

        setLoading(true);
        try {
            await registerUser(username, password); 
            showAlert("Registration successful!", "success");

            const data = await loginUser(username, password); // Automatically log in
            login(username, data.token);

            navigate("/"); 
            onClose(); 
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                "Registration failed. Please try again.";
            showAlert(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal open={open} onClose={onClose} title="Register">
            <form onSubmit={handleRegister}>
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
                {loading ? (
                    <Loader />
                ) : (
                    <PrimaryButton type="submit" variant="contained" color="primary" fullWidth>
                        Register
                    </PrimaryButton>
                )}
            </form>
        </CustomModal>
    );
};

export default Register;
