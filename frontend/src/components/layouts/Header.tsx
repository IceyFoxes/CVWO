import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Link } from "react-router-dom";
import { ColorModeContext } from "../../theme/ColorMode";
import { LinkButton, PrimaryButton } from "../shared/Buttons";
import Login from "../modals/Login";
import Register from "../modals/Register";
import CreateThread from "../modals/CreateThread";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../hooks/useModal";

interface HeaderProps {
    toggleSidebar: () => void; 
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { mode, toggleColorMode } = useContext(ColorModeContext);
    const { showAlert } = useAlert();
    const { isLoggedIn, username, logout } = useAuth();
    const loginModal = useModal();
    const registerModal = useModal();
    const createModal = useModal();
    const theme = useTheme();

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
        <AppBar
            position="sticky"
            color="transparent"
            sx={{
                width: "100%",
                backgroundColor: theme.palette.primary.main,
                padding: { xs: "8px 16px", sm: "16px 32px" },
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: { xs: 2, sm: 4 },
                }}
            >
                {/* Menu Icon for Sidebar */}
                <IconButton
                    edge="start"
                    aria-label="menu"
                    onClick={toggleSidebar}
                    sx={{ color: theme.palette.primary.contrastText }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Title */}
                <Typography
                    sx={{
                        fontSize: {
                            xs: "1rem", // Mobile
                            sm: "1.25rem", // Tablet
                            md: "1.5rem", // Desktop
                        },
                        fontWeight: "bold",
                        letterSpacing: 1,
                    }}
                >
                    <Link
                        to="/"
                        style={{
                            textDecoration: "none",
                            color: theme.palette.primary.contrastText,
                        }}
                    >
                        School Forum
                    </Link>
                </Typography>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <PrimaryButton onClick={handleCreateOpen}>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "0.75rem",
                                    sm: "1rem",
                                    md: "1.25rem",
                                },
                                fontWeight: "bold",
                                letterSpacing: 1,
                            }}
                        >
                            Create New Thread
                        </Typography>
                    </PrimaryButton>
                    <CreateThread open={createModal.isOpen} onClose={createModal.closeModal} />

                    <IconButton
                        onClick={toggleColorMode}
                        sx={{
                            color: theme.palette.primary.contrastText,
                            borderRadius: "50%",
                            transition: "transform 0.3s ease",
                            "&:hover": {
                                transform: "rotate(15deg)", // Rotate on hover
                            },
                        }}
                    >
                        {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {/* User Section */}
                    {isLoggedIn ? (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: theme.palette.primary.contrastText,
                                    fontStyle: "italic",
                                    fontSize: {
                                        xs: "0.75rem",
                                        sm: "1rem",
                                        md: "1.25rem",
                                    },
                                }}
                            >
                                Welcome, {username}
                            </Typography>
                            <LinkButton
                                onClick={handleLogout}
                                to="/"
                                sx={{
                                    fontSize: {
                                        xs: "0.75rem",
                                        sm: "1rem",
                                        md: "1.25rem",
                                    },
                                }}
                            >
                                Logout
                            </LinkButton>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <PrimaryButton onClick={loginModal.openModal}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: {
                                            xs: "0.75rem",
                                            sm: "1rem",
                                            md: "1.25rem",
                                        },
                                    }}
                                >
                                    Login
                                </Typography>
                            </PrimaryButton>
                            <Login open={loginModal.isOpen} onClose={loginModal.closeModal} />

                            <PrimaryButton onClick={registerModal.openModal}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: {
                                            xs: "0.75rem",
                                            sm: "1rem",
                                            md: "1.25rem",
                                        },
                                    }}
                                >
                                    Register
                                </Typography>
                            </PrimaryButton>
                            <Register open={registerModal.isOpen} onClose={registerModal.closeModal} />
                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
