import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getThreads } from "../services/threadService";
import { Box, Typography } from "@mui/material";
import TagGroup from "../components/TagGroup";
import TagFilter from "../components/TagFilter";
import SearchBar from "../components/widgets/SearchBar";
import Loader from "../components/shared/Loader";
import Layout from "../components/layouts/Layout";
import { Thread } from "../components/CategoryGroup";

const CategoryPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractTags = (threads: Thread[]): string[] => {
        const uniqueTags = new Set<string>();
        threads.forEach((thread) => {
            if (thread.tag) uniqueTags.add(thread.tag);
        });
        return Array.from(uniqueTags);
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
                setThreads(response.threads || []);
                setTags(extractTags(response.threads || []));
                setFilteredThreads(response.threads || []); // Initially show all threads
            } catch (err) {
                console.error("Failed to fetch threads:", err);
                setError("Failed to fetch threads. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, [category]);

    useEffect(() => {
        // Apply tag and search filtering logic
        let result = threads;

        if (selectedTag) {
            result = result.filter((thread) => thread.tag === selectedTag);
        }

        if (searchQuery) {
            result = result.filter(
                (thread) =>
                    thread.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredThreads(result);
    }, [selectedTag, searchQuery, threads]);

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
                        {/* Search Bar */}
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchChange={(query: string) => setSearchQuery(query)}
                        />
                        {/* Tag Filter */}
                        <TagFilter
                            tags={tags}
                            selectedTag={selectedTag}
                            onFilterChange={(newTag) => setSelectedTag(newTag)}
                        />
                        {/* Display Threads by Tag */}
                        {selectedTag
                            ? // Show threads for the selected tag only
                              filteredThreads.length > 0 && (
                                  <TagGroup
                                      tag={selectedTag}
                                      threads={filteredThreads}
                                  />
                              )
                            : // Show all threads grouped by tag
                              tags.map((tag) => (
                                  <TagGroup
                                      key={tag}
                                      tag={tag}
                                      threads={filteredThreads.filter(
                                          (thread) => thread.tag === tag
                                      )}
                                  />
                              ))}
                    </>
                )}
            </Box>
        </Layout>
    );
};

export default CategoryPage;
