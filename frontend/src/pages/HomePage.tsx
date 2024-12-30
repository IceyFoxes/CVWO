import React, { useState, useEffect } from "react";
import { fetchCategories, getThreads } from "../services/threadService";
import { Box, Typography } from "@mui/material";
import Layout from "../components/layouts/Layout";
import { PrimaryButton } from "../components/shared/Buttons";
import Loader from "../components/shared/Loader";
import { useRefresh } from "../components/contexts/RefreshContext";
import CategoryGroup, { Thread } from "../components/CategoryGroup";
import Pagination from "../components/widgets/Pagination";
import SortMenu from "../components/widgets/SortMenu";

interface Category {
    id: number;
    name: string;
}

const HomePage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [threadsByCategory, setThreadsByCategory] = useState<{ [key: string]: Thread[] }>({});
    const [pageStates, setPageStates] = useState<{ [key: string]: number }>({}); // Current page per category
    const [totalPagesByCategory, setTotalPagesByCategory] = useState<{ [key: string]: number }>({});
    const [sortStates, setSortStates] = useState<{ [key: string]: string }>({}); // Sorting state per category
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshFlag } = useRefresh();

    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const categoriesData = await fetchCategories();
                setCategories(categoriesData.categories);

                const threadsPromises = categoriesData.categories.map(async (category: Category) => {
                    const currentPage = pageStates[category.name] || 1;
                    const sortBy = sortStates[category.name] || "created_at";
                    const response = await getThreads({
                        query: "",
                        sortBy: sortBy,
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

    // Pagination handler
    const handlePageChange = (categoryName: string, page: number) => {
        setPageStates((prev) => ({
            ...prev,
            [categoryName]: page,
        }));
    };

    // Sorting handler
    const handleSortChange = (categoryName: string, sortField: string) => {
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
                                    {/* Sort Menu for each category */}
                                    <SortMenu
                                        sortBy={sortStates[category.name] || "created_at"}
                                        onSortChange={(sortField) => handleSortChange(category.name, sortField)}
                                    />
                                    <CategoryGroup
                                        category={category}
                                        threads={threadsByCategory[category.name] || []}
                                        currentPath={`/category/${category.name}`}
                                    />
                                    {/* Pagination for each category */}
                                    <Pagination
                                        currentPage={pageStates[category.name] || 1}
                                        totalPages={totalPagesByCategory[category.name] || 1}
                                        onPageChange={(page) => handlePageChange(category.name, page)}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Typography>No categories found.</Typography>
                        )}
                    </>
                )}
            </Box>
        </Layout>
    );
};

export default HomePage;
