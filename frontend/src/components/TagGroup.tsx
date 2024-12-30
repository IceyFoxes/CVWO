import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import CustomCard from "./shared/Card";
import Pagination from "./widgets/Pagination";
import SortMenu from "./widgets/SortMenu";
import TagFilter from "./TagFilter"; // Import TagFilter component
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
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
    const [sortBy, setSortBy] = useState(defaultSortBy);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const extractTagsFromThreads = (threads: Thread[]): string[] => {
        const uniqueTags = new Set<string>();
        threads.forEach((thread) => {
            if (thread.tag) {
                uniqueTags.add(thread.tag);
            }
        });
        return Array.from(uniqueTags);
    };

    const availableTags = extractTagsFromThreads(threads);

    useEffect(() => {
        // Apply tag filtering
        const threadsToFilter = selectedTag
            ? threads.filter((thread) => thread.tag === selectedTag)
            : threads;

        // Sort filtered threads
        const sorted = [...threadsToFilter].sort((a, b) => {
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
    }, [threads, selectedTag, sortBy]);

    useEffect(() => {
        // Paginate sorted threads
        const paginated = sortedThreads.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        setFilteredThreads(paginated);
    }, [sortedThreads, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSortChange = (sortField: string) => {
        setSortBy(sortField);
        setCurrentPage(1); // Reset to first page on sort change
    };

    const handleTagChange = (tag: string | null) => {
        setSelectedTag(tag);
        setCurrentPage(1); // Reset to first page on tag change
    };

    return (
        <Box sx={{ marginBottom: 4 }}>
            <Typography variant="h5" gutterBottom>
                {tag}
            </Typography>
            {/* Tag Filter */}
            <TagFilter
                tags={availableTags}
                selectedTag={selectedTag}
                onFilterChange={(newTag) => handleTagChange(newTag === "All Tags" ? null : newTag)}
            />
            {/* Sort Menu */}
            <SortMenu sortBy={sortBy} onSortChange={handleSortChange} />
            {/* Thread Cards */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {filteredThreads.map((thread) => (
                    <CustomCard key={thread.id} thread={thread} />
                ))}
            </Box>
            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(sortedThreads.length / itemsPerPage)}
                onPageChange={handlePageChange}
            />
        </Box>
    );
};

export default TagGroup;
