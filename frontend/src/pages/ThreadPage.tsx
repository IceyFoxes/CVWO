import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LikesDislikes from "../components/LikesDislikes";
import Timestamp from "../components/shared/Timestamp";
import CommentSection from "../components/CommentSection";
import DeleteThread from "../components/DeleteThread";
import { getThreadAuthorization, getThreadById } from "../services/threadService";
import Layout from "../components/layouts/Layout";
import { PrimaryButton } from "../components/shared/Buttons";
import UpdateThread from "../components/UpdateThread";
import { Thread } from "../components/CategoryGroup";
import Loader from "../components/shared/Loader";
import SaveUnsave from "../components/SaveUnsave";
import { useAuth } from "../components/contexts/AuthContext";

const ThreadDetails: React.FC = () => {
    const { id = "" } = useParams<{ id: string }>();
    const [thread, setThread] = useState<Thread | null>(null);
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { username } = useAuth();
    const navigate = useNavigate();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const navigateToParent = () => {
        if (thread?.parentId) {
            navigate(`/threads/${thread.parentId}`);
        }
    };
    
    const fetchThreadDetails = useCallback(async () => {
        try {
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
    if (!thread) return <Loader></Loader>;

    return (
        <Layout>
            {thread.parentId && (
                <PrimaryButton
                    variant="outlined"
                    color="primary"
                    onClick={navigateToParent}
                    style={{ marginBottom: "16px" }}
                >
                    Go to Parent Thread
                </PrimaryButton>
            )}
            
            <div>
                <h1>{thread.title}</h1>
                <p>{thread.content}</p>

                <small>
                    Posted by {" "} 
                    <Link
                        to={`/profile/${thread.author}`} 
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        {thread.author}
                    </Link> 
                    <Timestamp date={thread.createdAt} />
                </small>

                <LikesDislikes threadId={id} />
                
                {username && (
                    <SaveUnsave threadId={id} />
                )}

                {authorized && (
                    <div>
                        <PrimaryButton onClick={handleOpenModal}>Edit</PrimaryButton>
                        <UpdateThread open={isModalOpen} onClose={handleCloseModal} threadId={id} />
                        <DeleteThread threadId={id} authorized={authorized} />
                    </div>
                )}

                <CommentSection
                    threadId={id}
                    username={username}
                />

            </div>
        </Layout>
    );
};

export default ThreadDetails;
