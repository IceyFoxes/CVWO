import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Link } from "react-router-dom";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ColorModeContext } from "../../theme/ColorMode";
import { headerStyles } from "../shared/Styles";
import { LinkButton, PrimaryButton } from "../shared/Buttons";
import Login from "../modals/Login";
import Register from "../modals/Register";
import CreateThread from "../modals/CreateThread";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../hooks/useModal"

const Header: React.FC = () => {
    const { mode, toggleColorMode } = useContext(ColorModeContext);
    const { showAlert } = useAlert();
    const { isLoggedIn, username, logout } = useAuth();
    const loginModal = useModal();
    const registerModal = useModal();
    const createModal = useModal();

    const handleCreateOpen = () => {
        if (!isLoggedIn || !username) {
            showAlert("You must be logged in to create a thread.", "error");
            return;
        }
        createModal.openModal();
    };

    const handleLogout = () => {
        logout();
        showAlert("You have been logged out.", "success");
    };

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" sx={headerStyles}>
                    <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                        School Forum
                    </Link>
                </Typography>

                <Box sx={{ marginTop: 4, textAlign: "center" }}>
                    <PrimaryButton onClick={handleCreateOpen}>Create New Thread</PrimaryButton>
                    <CreateThread open={createModal.isOpen} onClose={createModal.closeModal} />
                </Box>

                <IconButton color="inherit" onClick={toggleColorMode} sx={headerStyles}>
                    {mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>

                {isLoggedIn ? (
                    <Box sx={headerStyles}>
                        <Typography variant="body2" gutterBottom sx={{ marginRight: 2 }}>
                            Welcome, {username}
                        </Typography>
                        <LinkButton color="secondary" onClick={handleLogout} to="/" sx={{ marginLeft: 1 }}>
                            Logout
                        </LinkButton>
                    </Box>
                ) : (
                    <>
                        <PrimaryButton onClick={loginModal.openModal} sx={headerStyles}>
                            Login
                        </PrimaryButton>
                        <Login open={loginModal.isOpen} onClose={loginModal.closeModal} />

                        <PrimaryButton onClick={registerModal.openModal} sx={headerStyles}>
                            Register
                        </PrimaryButton>
                        <Register open={registerModal.isOpen} onClose={registerModal.closeModal} />
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
