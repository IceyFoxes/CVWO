import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Typography, List } from "@mui/material";
import SearchBar from "../widgets/SearchBar";
import SortMenu from "../widgets/SortMenu";
import { getUserActivity } from "../../services/userService";
import ContentItem from "./UserContent";

type SortField = "createdAt" | "likes" | "dislikes" | "comments";

interface Thread {
    id: number;
    title?: string;
    content: string;
    author: string;
    parentAuthor?: string;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
}

const UserActivity: React.FC<{ username: string }> = ({ username }) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [comments, setComments] = useState<Thread[]>([]);
    const [filteredContent, setFilteredContent] = useState<Thread[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortField>("createdAt");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getUserActivity(username);
                const threadsData = data.threads ?? [];
                const commentsData = data.comments ?? [];

                setThreads(threadsData);
                setComments(commentsData);
                setFilteredContent([...threadsData, ...commentsData]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [username]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        filterAndSortContent(query, sortBy, activeTab);
    };

    const handleSortChange = (sortField: SortField) => {
        setSortBy(sortField);
        filterAndSortContent(searchQuery, sortField, activeTab);
    };

    const filterAndSortContent = (query: string, sort: SortField, tab: string) => {
        let content = [];
        if (tab === "threads") {
            content = threads;
        } else if (tab === "comments") {
            content = comments;
        } else {
            content = [...threads, ...comments];
        }

        // Filter
        if (query) {
            content = content.filter(
                (item) =>
                    item.title?.toLowerCase().includes(query.toLowerCase()) ||
                    item.content.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Sort
        content = content.sort((a, b) => {
            if (sort === "createdAt") {
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

        setFilteredContent(content);
    };

    const handleTabChange = (_: React.ChangeEvent<{}>, tab: string) => {
        setActiveTab(tab);
        filterAndSortContent(searchQuery, sortBy, tab);
    };

    return (
        <Box>
            <Typography variant="h4">{username}'s Activity</Typography>
            <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
            <SortMenu
                sortBy={sortBy}
                onSortChange={handleSortChange} // Updated to ensure compatibility
            />
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ marginBottom: 2 }}
            >
                <Tab value="overview" label="Overview" />
                <Tab value="threads" label="Threads" />
                <Tab value="comments" label="Comments" />
            </Tabs>
            <List>
                {filteredContent.map((item) => (
                    <ContentItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        content={item.content}
                        author={item.author}
                        parentAuthor={item.parentAuthor}
                        createdAt={item.createdAt}
                    />
                ))}
            </List>
        </Box>
    );
};

export default UserActivity;
