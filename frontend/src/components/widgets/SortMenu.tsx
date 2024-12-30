import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { inputStyles } from "../shared/Styles";

interface SortMenuProps {
    sortBy: string;
    onSortChange: (sortField: string) => void;
    excludedOptions?: string[]; // List of options to exclude
}

const SortMenu: React.FC<SortMenuProps> = ({ sortBy, onSortChange, excludedOptions = [] }) => {
    const options = [
        { value: "created_at", label: "Most Recent" },
        { value: "likes", label: "Most Liked" },
        { value: "dislikes", label: "Most Disliked" },
        { value: "comments", label: "Most Commented" },
    ];

    const handleSortChange = (event: SelectChangeEvent) => {
        onSortChange(event.target.value);
    };

    return (
        <Box sx={{ marginBottom: 2 }}>
            <FormControl fullWidth sx={inputStyles}>
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                    labelId="sort-select-label"
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sort By"
                >
                    {options
                        .filter((option) => !excludedOptions.includes(option.value)) // Exclude unwanted options
                        .map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default SortMenu;
