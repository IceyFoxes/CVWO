import React from "react";
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";

interface TagFilterProps {
    tags: string[];
    selectedTag: string | null; // Controlled selected tag from the parent
    onFilterChange: (tag: string | null) => void; // Callback for tag change
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTag, onFilterChange }) => {
    const handleChange = (event: SelectChangeEvent<string>) => {
        const tag = event.target.value === "ALL_TAGS" ? null : event.target.value;
        onFilterChange(tag); // Notify parent of the selected tag
    };

    return (
        <FormControl fullWidth>
            <InputLabel>Filter by Tag</InputLabel>
            <Select
                value={selectedTag ?? "ALL_TAGS"} // Default to "ALL_TAGS" if no tag is selected
                onChange={handleChange}
                label="Filter by Tag"
            >
                <MenuItem value="ALL_TAGS">All Tags</MenuItem>
                {tags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                        {tag}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default TagFilter;


