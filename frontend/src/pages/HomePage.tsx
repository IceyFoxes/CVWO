import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { fetchCategories, getThreads } from "../services/threadService";
import Layout from "../components/layouts/Layout";
import { PrimaryButton } from "../components/shared/Buttons";
import Loader from "../components/shared/Loader";
import Pagination from "../components/widgets/Pagination";
import SortMenu from "../components/widgets/SortMenu";
import CustomCard from "../components/shared/Card";
import { useRefresh } from "../components/contexts/RefreshContext";

export interface Thread {
    id: number;
    title?: string | null;
    content: string;
    category?: string | null;
    author: string;
    parentAuthor?: string;
    createdAt: string;
    userId: number;
    parentId?: number | null;
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    depth: number;
    tag?: string | null;
}

interface Category {
    id: number;
    name: string;
}

type SortField = "createdAt" | "likes" | "dislikes" | "comments";

const HomePage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [threadsByCategory, setThreadsByCategory] = useState<{ [key: string]: Thread[] }>({});
    const [pageStates, setPageStates] = useState<{ [key: string]: number }>({});
    const [totalPagesByCategory, setTotalPagesByCategory] = useState<{ [key: string]: number }>({});
    const [sortStates, setSortStates] = useState<{ [key: string]: SortField }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshFlag } = useRefresh();

    const itemsPerPage = 3;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const categoriesData = await fetchCategories();
                setCategories(categoriesData.categories);

                const threadsPromises = categoriesData.categories.map(async (category: Category) => {
                    const currentPage = pageStates[category.name] || 1;
                    const sortBy = sortStates[category.name] || "createdAt";
                    const response = await getThreads({
                        query: "",
                        sortBy,
                        page: currentPage,
                        limit: itemsPerPage,
                        category: category.name,
                    });

                    setTotalPagesByCategory((prev) => ({
                        ...prev,
                        [category.name]: response.totalPages,
                    }));

                    return { [category.name]: response.threads || [] };
                });

                const threadsArray = await Promise.all(threadsPromises);
                const threads = threadsArray.reduce((acc, threadObj) => ({ ...acc, ...threadObj }), {});
                setThreadsByCategory(threads);

                setError(null);
            } catch (err) {
                console.error("Failed to fetch threads or categories:", err);
                setError("Failed to fetch threads or categories. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshFlag, pageStates, sortStates]);

    const handlePageChange = (categoryName: string, page: number) => {
        setPageStates((prev) => ({
            ...prev,
            [categoryName]: page,
        }));
    };

    const handleSortChange = (categoryName: string, sortField: SortField) => {
        setSortStates((prev) => ({
            ...prev,
            [categoryName]: sortField,
        }));
        setPageStates((prev) => ({
            ...prev,
            [categoryName]: 1, // Reset to page 1 when sorting changes
        }));
    };

    return (
        <Layout>
            <Box>
                {error && (
                    <Box sx={{ color: "red", marginBottom: 2 }}>
                        <Typography>{error}</Typography>
                        <PrimaryButton
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            Retry
                        </PrimaryButton>
                    </Box>
                )}

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <Box key={category.id} sx={{ marginBottom: 4 }}>
                                    {/* Category Header */}
                                    <Box
                                        component={Link}
                                        to={`/category/${category.name}`}
                                        sx={{
                                            display: "block",
                                            marginBottom: 2,
                                            textDecoration: "none",
                                            padding: { xs: "8px 16px", sm: "12px 24px" },
                                            backgroundColor: (theme) => theme.palette.primary.main,
                                            color: (theme) => theme.palette.primary.contrastText,
                                            borderRadius: "8px",
                                            "&:hover": {
                                                backgroundColor: (theme) => theme.palette.primary.dark,
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                                            }}
                                        >
                                            {category.name}
                                        </Typography>
                                    </Box>

                                    {/* Sort Menu */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 2,
                                            paddingX: { xs: 1, sm: 2 },
                                        }}
                                    >
                                        <SortMenu
                                            sortBy={sortStates[category.name] || "createdAt"}
                                            onSortChange={(sortField) =>
                                                handleSortChange(category.name, sortField as SortField)
                                            }
                                        />
                                    </Box>

                                    {/* Threads under the category */}
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, // Responsive columns
                                            gap: 2,
                                            padding: 2,
                                        }}
                                    >
                                        {(threadsByCategory[category.name] || []).map((thread) => (
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
                                                    dislikes: thread.dislikesCount,
                                                    comments: thread.commentsCount,
                                                    createdAt: thread.createdAt,
                                                }}
                                                footer={thread.tag ?? ""}
                                            />
                                        ))}
                                    </Box>

                                    {/* Pagination */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            marginTop: 2,
                                        }}
                                    >
                                        <Pagination
                                            currentPage={pageStates[category.name] || 1}
                                            totalPages={totalPagesByCategory[category.name] || 1}
                                            onPageChange={(page) => handlePageChange(category.name, page)}
                                        />
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Typography
                                sx={{
                                    textAlign: "center",
                                    color: (theme) => theme.palette.text.primary,
                                    fontSize: { xs: "1rem", sm: "1.25rem" },
                                    marginTop: 4,
                                }}
                            >
                                No categories found.
                            </Typography>
                        )}
                    </>

                )}
            </Box>
        </Layout>
    );
};

export default HomePage;
