import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import LikesDislikes from "./LikesDislikes";
import Timestamp from "./Timestamp";
import CommentSection from "./CommentSection";
import DeleteThread from "./DeleteThread";

interface Thread {
    id: number;
    title: string;
    content: string;
    created_at: string;
    parent_id: number | null;
}

const ThreadDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [thread, setThread] = useState<Thread | null>(null);
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [error, setError] = useState<string | null>(null);

    const username = sessionStorage.getItem("username");

    const fetchThreadDetails = useCallback(async () => {
        try {
            setError(null);
            const threadResponse = await axiosInstance.get(`/threads/${id}`, {
                params: { page: pagination.page },
            });
            setThread(threadResponse.data.thread);
            setPagination((prev) => ({
                ...prev,
                totalPages: threadResponse.data.totalPages,
            }));

            const authResponse = await axiosInstance.get(`/threads/${id}/authorize`, {
                params: { username },
            });
            setAuthorized(authResponse.data.authorized || false);
        } catch (error) {
            console.error("Failed to fetch thread details:", error);
            setError("Failed to load thread details. Please try again.");
        }
    }, [id, pagination.page, username]);

    useEffect(() => {
        fetchThreadDetails();
    }, [fetchThreadDetails]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!thread) return <p>Loading thread...</p>;

    return (
        <div>
            <h1>{thread.title}</h1>
            <p>{thread.content}</p>
            <small>
                Posted on: <Timestamp date={thread.created_at} />
            </small>
            <LikesDislikes threadId={parseInt(id ?? "0", 10)} />

            {authorized && (
                <div>
                    <button onClick={() => navigate(`/threads/edit/${id}`)} style={{ color: "blue" }}>
                        Edit
                    </button>
                    <DeleteThread threadId={parseInt(id ?? "0", 10)} authorized={authorized} />
                </div>
            )}

            <CommentSection
                threadId={parseInt(id ?? "0", 10)}
                username={sessionStorage.getItem("username")}
            />

        </div>
    );
};

export default ThreadDetails;
