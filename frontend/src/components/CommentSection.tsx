import React, { useState } from "react";
import axiosInstance from "../axiosConfig";
import CommentList from "./CommentList";
import Search from "./Search";
import Sort from "./Sort";

interface CommentSectionProps {
    threadId: number;
    username: string | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ threadId, username }) => {
    const [commentContent, setCommentContent] = useState<string>("");
    const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
    const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(""); 
    const [sortBy, setSortBy] = useState<string>("created_at")

    const handleCommentSubmit = async () => {
        if (!username) {
            alert("You must be logged in to comment.");
            return;
        }

        if (!commentContent.trim()) {
            alert("Comment content cannot be empty.");
            return;
        }

        try {
            await axiosInstance.post(
                `/threads/${threadId}/comment`,
                { content: commentContent },
                { params: { username } }
            );
            alert("Comment added successfully.");
            setCommentContent(""); // Clear the comment field
            setShowCommentBox(false); // Hide the comment box
            setRefreshFlag(!refreshFlag); // Trigger refresh
        } catch (error) {
            console.error("Failed to add comment:", error);
            setError("Failed to add comment. Please try again.");
        }
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ marginTop: "20px" }}>
            <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <Sort sortBy={sortBy} setSortBy={setSortBy} excludedOptions={["comments"]} />

            <button onClick={() => setShowCommentBox(!showCommentBox)} style={{ marginBottom: "10px" }}>
                {showCommentBox ? "Cancel Comment" : "Add Comment"}
            </button>
            {showCommentBox && (
                <div>
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write your comment here..."
                        style={{ width: "100%", height: "100px", marginTop: "10px" }}
                    ></textarea>
                    <button onClick={handleCommentSubmit} style={{ marginTop: "10px" }}>
                        Submit Comment
                    </button>
                </div>
            )}
            <h4>Comments</h4>
            <CommentList 
                threadId={threadId} 
                searchQuery={searchQuery} 
                sortBy={sortBy} 
                refreshFlag={refreshFlag}  
            />
        </div>
    );
};

export default CommentSection;
