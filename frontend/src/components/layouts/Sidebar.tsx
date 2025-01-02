import React, { useState, useEffect } from "react";
import { List, ListItemButton, ListItemText, Divider, Typography, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { fetchCategories } from "../../services/threadService";
import { getUserSavedThreads } from "../../services/userService";
import { useRefresh } from "../contexts/RefreshContext";
import { useAuth } from "../contexts/AuthContext";
import { sidebarContainer, listItemStyles } from "../shared/Styles";

interface Category {
    id: number;
    name: string;
}

interface SavedThread {
    id: number;
    title: string;
}

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [categories, setCategories] = useState<Category[]>([]); // Explicit type for categories
    const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]); // Explicit type for savedThreads
    const { refreshFlag } = useRefresh();
    const { isLoggedIn, username } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, savedThreadsData] = await Promise.all([
                    fetchCategories(),
                    isLoggedIn ? getUserSavedThreads(username ?? "") : Promise.resolve({ savedThreads: [] }),
                ]);
                setCategories(categoriesData.categories || []);
                setSavedThreads(savedThreadsData.savedThreads || []);
            } catch (error) {
                console.error("Failed to fetch sidebar data:", error);
            }
        };

        fetchData();
    }, [username, isLoggedIn, refreshFlag]);

    return (
        <Box sx={sidebarContainer}>
            <Typography variant="h6" gutterBottom>
                Forum Navigation
            </Typography>

            <List>
                <ListItemButton
                    component={Link as React.ElementType}
                    to="/"
                    selected={location.pathname === "/"}
                    sx={listItemStyles}
                >
                    <ListItemText primary="Home" />
                </ListItemButton>
                {username && (
                    <ListItemButton
                        component={Link as React.ElementType}
                        to={`/profile/${username}`}
                        selected={location.pathname === `/profile/${username}`}
                        sx={listItemStyles}
                    >
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Categories
                </Typography>
                {categories.map((category) => (
                    <ListItemButton
                        key={category.id}
                        component={Link as React.ElementType}
                        to={`/category/${category.name}`}
                        selected={location.pathname.includes(`/category/${category.name}`)}
                        sx={listItemStyles}
                    >
                        <ListItemText primary={category.name} />
                    </ListItemButton>
                ))}

                <Typography variant="h6" gutterBottom>
                    Saved Threads
                </Typography>
                {savedThreads.length === 0 ? (
                    <Typography>{username ? "No saved threads" : "Login to view saved threads"}</Typography>
                ) : (
                    <List>
                        {savedThreads.map((thread) => (
                            <ListItemButton
                                key={thread.id}
                                component={Link as React.ElementType}
                                to={`/threads/${thread.id}`}
                                sx={listItemStyles}
                            >
                                <ListItemText primary={thread.title} />
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </List>
        </Box>
    );
};

export default Sidebar;
