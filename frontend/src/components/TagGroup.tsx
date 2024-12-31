import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import CustomCard from "./shared/Card";
import Pagination from "./widgets/Pagination";
import SortMenu from "./widgets/SortMenu";
import { Thread } from "./CategoryGroup";

interface ThreadGroupProps {
    tag: string;
    threads: Thread[];
    itemsPerPage?: number;
    defaultSortBy?: string;
}

const TagGroup: React.FC<ThreadGroupProps> = ({ tag, threads, itemsPerPage = 5, defaultSortBy = "created_at" }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortedThreads, setSortedThreads] = useState<Thread[]>([]);
    const [sortBy, setSortBy] = useState(defaultSortBy);

    useEffect(() => {
        // Sort threads based on sortBy
        const sorted = [...threads].sort((a, b) => {
            if (sortBy === "created_at") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === "likes") {
                return b.likesCount - a.likesCount;
            } else if (sortBy === "dislikes") {
                return b.dislikesCount - a.dislikesCount;
            } else if (sortBy === "comments") {
                return b.commentsCount - a.commentsCount;
            }
            return 0;
        });
        setSortedThreads(sorted);
    }, [threads, sortBy]);

    const paginatedThreads = sortedThreads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Box sx={{ marginBottom: 4 }}>
            <Typography variant="h5" gutterBottom>
                {tag}
            </Typography>
            <SortMenu sortBy={sortBy} onSortChange={setSortBy} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {paginatedThreads.map((thread) => (
                    <CustomCard key={thread.id} thread={thread} />
                ))}
            </Box>
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(sortedThreads.length / itemsPerPage)}
                onPageChange={setCurrentPage}
            />
        </Box>
    );
};

export default TagGroup;
