import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";

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
                const response = await axiosInstance.get(`/threads/${id}`);
                setTitle(response.data.thread?.title || null); // Null for comments
                setContent(response.data.thread.content || "");
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
            await axiosInstance.put(`/threads/${id}`,
                {
                    title: title || undefined, // Include title only for threads
                    content,
                },
                {
                    params: { username }, // Attach username as a query parameter
                }
            );
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
