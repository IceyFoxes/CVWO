import React, { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import CommentList from "./CommentList";
import SearchBar from "./widgets/SearchBar";
import SortMenu from "./widgets/SortMenu";
import { postComment } from "../services/threadService";
import { useAlert } from "./contexts/AlertContext";
import { useRefresh } from "./contexts/RefreshContext"; // Import RefreshContext
import { inputStyles } from "./shared/Styles";
import { PrimaryButton } from "./shared/Buttons";

interface CommentSectionProps {
    threadId: string;
    username: string | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ threadId, username }) => {
    const [commentContent, setCommentContent] = useState<string>("");
    const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("created_at");

    const { showAlert } = useAlert();
    const { triggerRefresh } = useRefresh(); 

    const handleCommentSubmit = async () => {
        if (!username) {
            showAlert("You must be logged in to comment.", "error");
            return;
        }

        if (!commentContent.trim()) {
            showAlert("Comment content cannot be empty.", "error");
            return;
        }

        try {
            await postComment(threadId, username, commentContent);
            showAlert("Comment added successfully.", "success");
            setCommentContent("");
            setShowCommentBox(false);
            triggerRefresh(); // Trigger refresh when a comment is added
        } catch (error: any) {
            console.error("Failed to add comment:", error);
            showAlert("Failed to add comment. Please try again.", "error");
        }
    };

    return (
        <Box sx={{ marginTop: 4 }}>
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <SortMenu sortBy={sortBy} onSortChange={setSortBy} excludedOptions={["comments"]} />

            <PrimaryButton onClick={() => setShowCommentBox(!showCommentBox)}>
                {showCommentBox ? "Cancel Comment" : "Add Comment"}
            </PrimaryButton>

            {showCommentBox && (
                <Box sx={{ marginBottom: 4 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write your comment here..."
                        sx={inputStyles}
                    />
                    <PrimaryButton onClick={handleCommentSubmit}>Submit Comment</PrimaryButton>
                </Box>
            )}

            <Typography variant="h6" sx={{ marginTop: 4, marginBottom: 2 }}>
                Comments
            </Typography>
            <CommentList threadId={threadId} searchQuery={searchQuery} sortBy={sortBy} />
        </Box>
    );
};

export default CommentSection;

