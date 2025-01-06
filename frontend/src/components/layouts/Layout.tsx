import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the screen is small

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Header />

            {/* Main Content Area */}
            <Box
                sx={{
                    display: "flex",
                    flexGrow: 1,
                }}
            >
                {/* Conditionally Render Sidebar */}
                {!isSmallScreen && (
                    <Box
                        sx={{
                            width: 250,
                            borderRight: "1px solid #ddd",
                            backgroundColor: (theme) => theme.palette.background.paper,
                            padding: 2,
                            height: "calc(100vh - 100px)", // Adjust for header height
                            overflowY: "auto",
                            position: "sticky",
                            top: 100,
                        }}
                    >
                        <Sidebar />
                    </Box>
                )}

                {/* Main Content */}
                <Box
                    sx={{
                        flexGrow: 1,
                        padding: { xs: 2, sm: 4 },
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;