import React, { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Autocomplete } from "@mui/material";
import CustomModal from "../shared/Modal";
import { inputStyles } from "../shared/Styles";
import { createThread, fetchCategories, fetchTags } from "../../services/threadService";
import { PrimaryButton } from "../shared/Buttons";
import { useAlert } from "../contexts/AlertContext";
import { getAuthorization } from "../../services/userService";
import { useRefresh } from "../contexts/RefreshContext";
import { useAuth } from "../contexts/AuthContext";

const CreateThread: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [tag, setTag] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);
    const [tagOptions, setTagOptions] = useState<string[]>([]);
    const { showAlert } = useAlert();
    const { triggerRefresh } = useRefresh();
    const { username } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesData = await fetchCategories();
                const allCategories = categoriesData.categories.map((cat: any) => cat.name);

                const isAdmin = await getAuthorization(username);
                const filteredCategories = allCategories.filter(
                    (category: string) => category !== "Featured" || isAdmin
                );

                setCategories(filteredCategories);

                const tags = await fetchTags();
                setTagOptions(Array.isArray(tags) ? tags : []);
            } catch (error) {
                showAlert("Failed to fetch categories or tags. Please try again.", "error");
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, [username, showAlert]);

    const handleSubmit = async () => {
        try {
            await createThread(username, title, content, category, tag);
            triggerRefresh();
            showAlert("Thread created successfully!", "success");
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

    return (
        <CustomModal open={open} onClose={onClose} title="Create a New Thread" content="">
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
                <TextField
                    select
                    fullWidth
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    margin="normal"
                    required
                    sx={inputStyles}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat}
                        </MenuItem>
                    ))}
                </TextField>
                <Autocomplete
                    freeSolo
                    options={tagOptions}
                    value={tag || ""}
                    onChange={(_, newValue) => setTag(newValue ?? "")}
                    onInputChange={(_, newValue) => setTag(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Tag"
                            placeholder="Search or create a tag"
                            variant="outlined"
                            fullWidth
                            sx={inputStyles}
                        />
                    )}
                />
                <PrimaryButton onClick={handleSubmit} disabled={!title || !content || !category || !tag}>Create New Thread</PrimaryButton>
            </Box>
        </CustomModal>
    );
};

export default CreateThread;
