import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getThreads } from "../services/threadService";
import { Box, Typography } from "@mui/material";
import ThreadGroup from "../components/ThreadGroup";
import { useAlert } from "../components/contexts/AlertContext";
import { useRefresh } from "../components/contexts/RefreshContext";
import Loader from "../components/shared/Loader";
import Layout from "../components/layouts/Layout";
import TagFilter from "../components/TagFilter";
import SortMenu from "../components/widgets/SortMenu";
import Pagination from "../components/widgets/Pagination";
import SearchBar from "../components/widgets/SearchBar";
import { Thread } from "../components/CategoryGroup";

const CategoryPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [tags, setTags] = useState<string[]>([]);
    const [tag, setTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { refreshFlag } = useRefresh();
    const { showAlert } = useAlert();

    const extractTagsFromThreads = (threads: Thread[]): string[] => {
        const tags = new Set<string>(); // Collect unique tags
        threads.forEach((thread) => {
            if (thread.tag) {
                tags.add(thread.tag);
            }
        });
        return Array.from(tags); // Convert the Set to an array
    };

    const filterAndSortThreads = (query: string, sort: string, tag: string | null) => {
        let filtered = threads;

        // Filter by tag
        if (tag) {
            filtered = filtered.filter((thread) => thread.tag === tag);
        }

        // Filter by search query
        if (query) {
            filtered = filtered.filter(
                (thread) =>
                    thread.title?.toLowerCase().includes(query.toLowerCase()) ||
                    thread.content.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Sort
        filtered = filtered.sort((a, b) => {
            if (sort === "created_at") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sort === "likes") {
                return b.likesCount - a.likesCount;
            } else if (sort === "dislikes") {
                return b.dislikesCount - a.dislikesCount;
            } else if (sort === "comments") {
                return b.commentsCount - a.commentsCount;
            }
            return 0;
        });

        setFilteredThreads(filtered);
    };

    const fetchThreads = async () => {
        try {
            setLoading(true);
            const response = await getThreads({
                query: "",
                sortBy: "created_at",
                page: 1,
                limit: 50, // Fetch a larger initial dataset
                category: category ?? "",
            });

            setThreads(response.threads || []);
            setFilteredThreads(response.threads || []); // Initialize filteredThreads
            setTags(extractTagsFromThreads(response.threads || []));
            setPagination({
                currentPage: response.currentPage,
                totalPages: response.totalPages,
            });
        } catch (err) {
            console.error("Failed to fetch threads:", err);
            setError("Failed to fetch threads. Please try again.");
            showAlert("Failed to fetch threads. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();
    }, [category, refreshFlag]);

    useEffect(() => {
        filterAndSortThreads(query, sortBy, tag);
    }, [query, sortBy, tag, threads]);

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
                        <SearchBar
                            searchQuery={query}
                            onSearchChange={(newQuery) => setQuery(newQuery)}
                        />
                        <TagFilter
                            tags={tags}
                            selectedTag={tag}
                            onFilterChange={(newTag) => setTag(newTag === "All Tags" ? null : newTag)}
                        />
                        <SortMenu
                            sortBy={sortBy}
                            onSortChange={(newSort) => setSortBy(newSort)}
                        />
                        <ThreadGroup tag={tag ?? "All Threads"} threads={filteredThreads} />
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={(newPage) => {
                                setPagination((prev) => ({ ...prev, currentPage: newPage }));
                                fetchThreads();
                            }}
                        />
                    </>
                )}
            </Box>
        </Layout>
    );
};

export default CategoryPage;
