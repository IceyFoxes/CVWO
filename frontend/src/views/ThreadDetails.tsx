import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LikesDislikes from "../components/LikesDislikes";
import Timestamp from "../components/Timestamp";
import CommentSection from "../components/CommentSection";
import DeleteThread from "../components/DeleteThread";
import { getThreadAuthorization, getThreadById } from "../services/threadService";

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
    const [error, setError] = useState<string | null>(null);

    const username = sessionStorage.getItem("username");
    
    const fetchThreadDetails = useCallback(async () => {
        try {
            if (!id) {
                console.error("Thread ID is undefined. Redirecting to ThreadList.");
                navigate("/threads");
                return null;
            }

            if (!username) {
                console.error("Username is undefined. Redirecting to Login.");
                navigate("/login");
                return null;
            }
            setError(null);
            const data = await getThreadById(id);
            setThread(data.thread);
            const authResponseData = await getThreadAuthorization(id, username);
            setAuthorized(authResponseData.authorized || false);
        } catch (error) {
            console.error("Failed to fetch thread details:", error);
            setError("Failed to load thread details. Please try again.");
        }
    }, [id, username]);

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
