import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import SearchBar from "../components/widgets/SearchBar";
import Pagination from "../components/widgets/Pagination";
import SortMenu, { SortField } from "../components/widgets/SortMenu";
import CustomCard from "../components/shared/Card";
import Loader from "../components/shared/Loader";
import Layout from "../components/layouts/Layout";
import { getThreads } from "../services/threadService";
import { Thread } from "./HomePage";

const CategoryPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [tagGroups, setTagGroups] = useState<Record<string, Thread[]>>({});
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paginationState, setPaginationState] = useState<
        Record<string, { page: number; sortBy: string }>
    >({});

    const itemsPerPage = 5;

    const groupThreadsByTag = (threads: Thread[]): Record<string, Thread[]> => {
        return threads.reduce<Record<string, Thread[]>>((acc, thread) => {
            const tag = thread.tag ?? "Untagged";
            if (!acc[tag]) acc[tag] = [];
            acc[tag].push(thread);
            return acc;
        }, {});
    };

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                setLoading(true);
                const response = await getThreads({
                    query: "",
                    sortBy: "created_at",
                    page: 1,
                    limit: 50,
                    category: category ?? "",
                });
                const fetchedThreads = response.threads || [];
                setTagGroups(groupThreadsByTag(fetchedThreads));

                // Initialize pagination state for each tag
                const initialPaginationState = Object.keys(groupThreadsByTag(fetchedThreads)).reduce(
                    (state, tag) => ({
                        ...state,
                        [tag]: { page: 1, sortBy: "createdAt" },
                    }),
                    {}
                );
                setPaginationState(initialPaginationState);
            } catch (err) {
                console.error("Failed to fetch threads:", err);
                setError("Failed to fetch threads. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, [category]);

    const handleSortChange = (tag: string, sortBy: string) => {
        setPaginationState((prev) => ({
            ...prev,
            [tag]: { ...prev[tag], sortBy },
        }));
    };

    const handlePageChange = (tag: string, page: number) => {
        setPaginationState((prev) => ({
            ...prev,
            [tag]: { ...prev[tag], page },
        }));
    };

    const sortThreads = (threads: Thread[], sortBy: string) => {
        return [...threads].sort((a, b) => {
            switch (sortBy) {
                case "createdAt":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "likes":
                    return b.likesCount - a.likesCount;
                case "dislikes":
                    return b.dislikesCount - a.dislikesCount;
                case "comments":
                    return b.commentsCount - a.commentsCount;
                default:
                    return 0;
            }
        });
    };

    const paginateThreads = (threads: Thread[], page: number) => {
        const startIndex = (page - 1) * itemsPerPage;
        return threads.slice(startIndex, startIndex + itemsPerPage);
    };

    return (
        <Layout>
            <Box sx={{ padding: 4 }}>
                {error && (
                    <Typography color="error" sx={{ marginBottom: 2 }}>
                        {error}
                    </Typography>
                )}
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <Typography variant="h4" gutterBottom>
                            {category ?? "All Threads"}
                        </Typography>
                        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                        {Object.entries(tagGroups).map(([tag, threads]) => {
                            const { page, sortBy } = paginationState[tag] || { page: 1, sortBy: "createdAt" };
                            const filteredThreads = threads.filter(
                                (thread) =>
                                    thread.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
                            );
                            const sortedThreads = sortThreads(filteredThreads, sortBy);
                            const paginatedThreads = paginateThreads(sortedThreads, page);

                            return (
                                <Box key={tag} sx={{ marginBottom: 4 }}>
                                    <Typography variant="h5" gutterBottom>
                                        {tag}
                                    </Typography>
                                    <SortMenu
                                        sortBy={sortBy as SortField}
                                        onSortChange={(field) => handleSortChange(tag, field)}
                                    />
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                        {paginatedThreads.map((thread) => (
                                            <CustomCard
                                                key={thread.id}
                                                title={thread.title ?? "Untitled Thread"}
                                                content={
                                                    <Typography variant="body2">
                                                        {thread.content.length > 100
                                                            ? `${thread.content.substring(0, 100)}...`
                                                            : thread.content}
                                                    </Typography>
                                                }
                                                linkTo={`/threads/${thread.id}`}
                                                metadata={{
                                                    author: thread.author,
                                                    likes: thread.likesCount,
                                                    comments: thread.commentsCount,
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    <Pagination
                                        currentPage={page}
                                        totalPages={Math.ceil(filteredThreads.length / itemsPerPage)}
                                        onPageChange={(newPage) => handlePageChange(tag, newPage)}
                                    />
                                </Box>
                            );
                        })}
                    </>
                )}
            </Box>
        </Layout>
    );
};

export default CategoryPage;

 