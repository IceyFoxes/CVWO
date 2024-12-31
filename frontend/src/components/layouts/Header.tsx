import React, { useContext, useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Link } from "react-router-dom";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ColorModeContext } from "../../theme/ColorMode";
import { headerStyles } from "../shared/Styles";
import { LinkButton, PrimaryButton } from "../shared/Buttons";
import Login from "../Login";
import Register from "../Register";
import { useAlert } from "../contexts/AlertContext";
import CreateThread from "../CreateThread";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
    const { mode, toggleColorMode } = useContext(ColorModeContext);
    const { showAlert } = useAlert();
    const [ isLoginModalOpen, setIsLoginModalOpen ] = useState(false);
    const [ isRegisterModalOpen, setIsRegisterModalOpen ] = useState(false);
    const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false);
    const { isLoggedIn, username, logout } = useAuth();

    const handleLoginOpen = () => setIsLoginModalOpen(true);
    const handleLoginClose = () => setIsLoginModalOpen(false);

    const handleRegisterOpen = () => setIsRegisterModalOpen(true);
    const handleRegisterClose = () => setIsRegisterModalOpen(false);

    const handleCreateOpen = () => {
        if (!isLoggedIn || !username) {
            showAlert("You must be logged in to create a thread.", "error");
            return;
        }

        setIsCreateModalOpen(true);
    };

    const handleClose = () => setIsCreateModalOpen(false);

    const handleLogout = () => {
        logout(); // Clear cookies via the Auth context
        showAlert("You have been logged out.", "success");
    };

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                {/* Logo / Title */}
                <Typography variant="h6" sx={headerStyles}>
                    <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                        Town Hall
                    </Link>
                </Typography>
                
                {/* Create Thread */}
                <Box sx={{ marginTop: 4, textAlign: "center" }}>
                    <PrimaryButton onClick={handleCreateOpen}>Create New Thread</PrimaryButton>
                    <CreateThread open={isCreateModalOpen} onClose={handleClose} />
                </Box>

                {/* Light/Dark Mode Toggle */}
                <IconButton color="inherit" onClick={toggleColorMode} sx={headerStyles}>
                    {mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>

                {/* User Authentication */}
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
                        <PrimaryButton onClick={handleLoginOpen} sx={headerStyles}>
                            Login
                        </PrimaryButton>
                        <Login open={isLoginModalOpen} onClose={handleLoginClose} />

                        <PrimaryButton onClick={handleRegisterOpen} sx={headerStyles}>
                            Register
                        </PrimaryButton>
                        <Register open={isRegisterModalOpen} onClose={handleRegisterClose} />
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;

