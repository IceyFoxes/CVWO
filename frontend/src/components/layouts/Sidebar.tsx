import React, { useState, useEffect } from "react";
import { List, ListItemButton, ListItemText, Divider, Typography, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { fetchCategories } from "../../services/threadService";
import { listItemStyles, sidebarContainer } from "../shared/Styles";
import { getUserSavedThreads } from "../../services/userService";
import { useRefresh } from "../contexts/RefreshContext";
import { useAuth } from "../contexts/AuthContext";

interface Category {
    id: number;
    name: string;
}
interface SavedThread {
    id: number;
    title: string;
    createdAt: string;
}

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]);
    const { refreshFlag } = useRefresh();
    const { isLoggedIn, username } = useAuth();

    // Fetch categories on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isLoggedIn) {
                    const savedThreadsData = await getUserSavedThreads(username ?? "");
                    setSavedThreads(savedThreadsData.savedThreads);
                }
                
                const categoriesData = await fetchCategories();
                setCategories(categoriesData.categories);
                
            } catch (error) {
                console.error("Failed to fetch categories:", error);
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
                {/* Static Links */}
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

                {/* Dynamic Categories */}
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

                {/* Dynamic Saved Threads */}
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
