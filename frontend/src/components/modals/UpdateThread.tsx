import React, { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import CustomModal from "../shared/Modal";
import { inputStyles } from "../shared/Styles";
import { updateThread, getThreadById } from "../../services/threadService";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../shared/Loader";

const UpdateThread: React.FC<{ open: boolean; onClose: () => void; threadId: string }> = ({ open, onClose, threadId }) => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { showAlert } = useAlert();
    const { username } = useAuth();

    // Reset state when modal opens
    useEffect(() => {
        if (!open) {
            setTitle("");
            setContent("");
            return;
        }

        const fetchThreadDetails = async () => {
            setLoading(true);
            try {
                const data = await getThreadById(threadId);
                setTitle(data.thread.title || "");
                setContent(data.thread.content || "");
            } catch (err) {
                console.error("Failed to fetch thread details:", err);
                showAlert("Unable to load thread details.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchThreadDetails();
    }, [showAlert, open, threadId]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            showAlert("Title and content cannot be empty.", "warning");
            return;
        }

        setLoading(true);
        try {
            await updateThread(threadId, username ?? "", title, content);
            showAlert("Thread updated successfully!", "success");
            onClose();
        } catch (err: any) {
            if (err.response?.status === 400) {
                const errors = err.response?.data?.errors; // Expecting `errors` as an array
                if (Array.isArray(errors)) {
                    errors.forEach((error) => showAlert(error, "error")); // Display all errors
                } else {
                    const errorMessage = err.response?.data?.error || "Validation failed.";
                    showAlert(errorMessage, "warning");
                }
            } else {
                // Fallback for other error types
                const errorMessage = err.response?.data?.error || "Failed to update thread. Please try again.";
                showAlert(errorMessage, "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title="Update Thread"
            onConfirm={handleSubmit}
        >
            {loading ? (
                <Loader></Loader>
            ) : (
                <Box>
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                        required
                        sx={inputStyles}
                    />
                    <TextField
                        fullWidth
                        label="Content"
                        multiline
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        margin="normal"
                        required
                        sx={inputStyles}
                    />
                </Box>
            )}
        </CustomModal>
    );
};

export default UpdateThread;
