import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Search from "../components/Search";
import Sort from "../components/Sort";
import Pagination from "../components/Pagination";
import { getThreads } from "../services/threadService";

export interface Thread {
    id: number;
    author: string;
    title: string;
    content: string;
    created_at: string;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
}

const ThreadList: React.FC = () => {
    const navigate = useNavigate();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [sortBy, setSortBy] = useState("created_at");
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAndSetThreads = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getThreads(searchQuery, sortBy, pagination.page, 10);
            const { threads = [], totalPages = 1 } = data;
            setThreads(threads);
            setPagination((prev) => ({ ...prev, totalPages }));
            setError(null);
        } catch (err) {
            console.error("Failed to fetch threads:", err);
            setError("Failed to fetch threads. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [searchQuery, pagination.page, sortBy]);

    useEffect(() => {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login", { state: { message: "You must be logged in!" } });
        } else {
            fetchAndSetThreads();
        }
    }, [navigate, fetchAndSetThreads]);

    return (
        <div>
            <h1>Threads</h1>

            <Search
                searchQuery={searchQuery}
                setSearchQuery={(query) => {
                    setSearchQuery(query);
                    setPagination({ ...pagination, page: 1 });
                }}
            />

            <Sort
                sortBy={sortBy}
                setSortBy={(newSortBy) => {
                    setSortBy(newSortBy);
                    setPagination({ ...pagination, page: 1 });
                }}
            />

            {error && (
                <div style={{ color: "red" }}>
                    <p>{error}</p>
                    <button onClick={fetchAndSetThreads}>Retry</button>
                </div>
            )}

            {loading ? (
                <div className="loading-spinner" aria-busy="true" aria-live="polite">
                    <p>Loading...</p>
                </div>
            ) : (
                <ul>
                    {threads.map((thread) => (
                        <li key={thread.id} style={{ marginBottom: "1em" }}>
                            <h3>{thread.title}</h3>
                            <p>{thread.content.substring(0, 100)}...</p>
                            <small>
                                By: {thread.author} | Likes: {thread.likes_count} | Dislikes: {thread.dislikes_count} | Comments: {thread.comments_count}
                            </small>
                            <br />
                            <small>Posted on: {new Date(thread.created_at).toLocaleString()}</small>
                            <br />
                            <Link to={`/threads/${thread.id}`}>View Details</Link>
                        </li>
                    ))}
                </ul>
            )}

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                setPage={(page) => setPagination({ ...pagination, page })}
            />

            <Link to="/create" style={{ display: "block", marginTop: "1em", textDecoration: "none" }}>
                Create New Thread
            </Link>
        </div>
    );
};

export default ThreadList;
