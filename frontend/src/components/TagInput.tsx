import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { fetchTags } from "../services/threadService";
import { inputStyles } from "./shared/Styles";

interface TagInputProps {
    tag: string;
    setTag: (tag: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tag, setTag }) => {
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tags = await fetchTags();
                setOptions(Array.isArray(tags) ? tags : []);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <Autocomplete
            freeSolo
            options={options}
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
    );
};

export default TagInput;

