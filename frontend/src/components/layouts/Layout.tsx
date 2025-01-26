import React, { useContext, useState } from "react";
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import lightBackground from "./lightBackground.webp";
import darkBackground from "./darkBackground.webp";
import { ColorModeContext } from "../../theme/ColorMode";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { mode } = useContext(ColorModeContext);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const backgroundImage = mode === "dark" ? darkBackground : lightBackground;
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };
    
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                width: "100%",
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >
            {/* Header */}
            <Header toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                {/* Sidebar */}
                <Drawer
                    anchor="left"
                    open={isSidebarOpen}
                    onClose={toggleSidebar}
                    variant={isSmallScreen ? "temporary" : "persistent"} // Temporary for small screens
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: isSmallScreen ? "80%" : "20%", 
                            backgroundColor: theme.palette.background.paper,
                            padding: "2%", 
                            top: "10%", 
                            ...(isSmallScreen && { height: "100vh", top: 0 }), 
                        },
                    }}
                >
                    <Sidebar />
                </Drawer>

                {/* Main Content */}
                <Box
                    sx={{
                        flexGrow: 1,
                        padding: { xs: "4%", sm: "3%" },
                        marginLeft: isSmallScreen ? 0 : (isSidebarOpen ? "20%" : 0), // Adjust margin for persistent sidebar
                        transition: theme.transitions.create("margin-left", {
                            duration: theme.transitions.duration.standard,
                        }),
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
