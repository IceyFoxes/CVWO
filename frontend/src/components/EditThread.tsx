import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { editThread, getThreadById } from "../services/threadService";

const EditThread: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (!id) {
                    console.error("Thread ID is undefined. Redirecting to ThreadList.");
                    navigate("/threads");
                    return null;
                }
                const data = await getThreadById(id);
                setTitle(data.thread?.title || null); // Null for comments
                setContent(data.thread.content || "");
                setLoading(false);
            } catch (error) {
                console.error("Error fetching details:", error);
                setError("Failed to load details.");
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const username = sessionStorage.getItem("username");

    const handleSubmit = async () => {
        // Validate content and title
        if (title === null && !content.trim()) {
            alert("Content cannot be empty.");
            return;
        }
    
        if (title !== null && (!title.trim() || !content.trim())) {
            alert("Title and content cannot be empty.");
            return;
        }
    
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
            await editThread(id, username, title, content);
            alert("Successfully updated!");
            navigate(`/threads/${id}`); // Redirect to thread details after update
        } catch (error) {
            console.error("Failed to update:", error);
        }
    };    
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            {title !== null && ( // Show title input only for threads
                <div>
                    <label htmlFor="title">Title: </label>
                    <br />
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            )}
            <div>
                <label htmlFor="content">Content: </label>
                <br />
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <button onClick={handleSubmit}>Save</button>
        </form>
    );
};

export default EditThread;
