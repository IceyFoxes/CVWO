import React from "react";
import { Link } from "react-router-dom";
import { ListItemButton, ListItemText, Box } from "@mui/material";
import { listItemStyles } from "../components/shared/Styles";
import CustomCard from "../components/shared/Card";

export interface Thread {
    id: number;
    title?: string | null;
    content: string;
    category?: string | null;
    author: string;
    createdAt: string;
    userId: number;
    parentId?: number | null;
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    depth: number;
    tag?: string | null;
}

interface CategoryGroupProps {
    category: { id: number; name: string };
    threads: Thread[];
    currentPath: string;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ category, threads, currentPath }) => {
    return (
        <React.Fragment key={category.id}>
            {/* Category Header */}
            <ListItemButton
                component={Link as React.ElementType}
                to={`/category/${category.name}`}
                selected={currentPath.includes(`/category/${category.name}`)}
                sx={listItemStyles}
            >
                <ListItemText primary={category.name} />
            </ListItemButton>

            {/* Threads under the category */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
                {threads.map((thread) => (
                    <CustomCard key={thread.id} thread={thread} />
                ))}
            </Box>
        </React.Fragment>
    );
};

export default CategoryGroup;
