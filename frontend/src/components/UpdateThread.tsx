import React, { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import CustomModal from "./shared/Modal";
import { inputStyles } from "./shared/Styles";
import { updateThread, getThreadById } from "../services/threadService";
import { useAlert } from "./contexts/AlertContext";

const UpdateThread: React.FC<{ open: boolean; onClose: () => void; threadId: string }> = ({ open, onClose, threadId }) => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const { showAlert } = useAlert();

    const username = sessionStorage.getItem("username");

    useEffect(() => {
        const fetchThreadDetails = async () => {
            try {
                const data = await getThreadById(threadId);
                setTitle(data.thread.title || "");
                setContent(data.thread.content || "");

            } catch (err) {
                console.error("Failed to fetch thread details:", err);
                setError("Unable to load thread details.");
            }
        };

        if (open) fetchThreadDetails();
    }, [open, threadId]);

    const handleSubmit = async () => {
        try {
            await updateThread(threadId, username ?? "", title, content);
            showAlert("Thread updated successfully!", "success");
            onClose();
        } catch (err: any) {
            let errorMessage = "An error occurred while creating the thread.";

            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.errors) {
                errorMessage = err.response.data.errors.join(", "); // Combine multiple errors into one message
            }

            showAlert(errorMessage, "error");
        }
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <CustomModal open={open} onClose={onClose} title="Update Thread" onConfirm={handleSubmit}>
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
        </CustomModal>
    );
};

export default UpdateThread;
