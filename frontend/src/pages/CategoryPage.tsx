import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getThreads } from "../services/threadService";
import { Box, Typography } from "@mui/material";
import TagGroup from "../components/TagGroup";
import Loader from "../components/shared/Loader";
import Layout from "../components/layouts/Layout";
import { Thread } from "../components/CategoryGroup";

const CategoryPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            } catch (err) {
                console.error("Failed to fetch threads:", err);
                setError("Failed to fetch threads. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, [category]);

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
                    <TagGroup tag={category ?? "All Threads"} threads={threads} />
                )}
            </Box>
        </Layout>
    );
};

export default CategoryPage;
