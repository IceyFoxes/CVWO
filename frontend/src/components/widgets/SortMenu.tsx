import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent } from "@mui/material";
import { inputStyles } from "../shared/Styles";

export type SortField = "createdAt" | "likes" | "dislikes" | "comments";

interface SortMenuProps {
    sortBy: SortField;
    onSortChange: (sortField: SortField) => void;
    excludedOptions?: string[]; // List of options to exclude
}

const SortMenu: React.FC<SortMenuProps> = ({ sortBy, onSortChange, excludedOptions = [] }) => {
    const options: { value: SortField; label: string }[] = [
        { value: "createdAt", label: "Most Recent" },
        { value: "likes", label: "Most Liked" },
        { value: "dislikes", label: "Most Disliked" },
        { value: "comments", label: "Most Commented" },
    ];

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value as SortField;
        onSortChange(value);
    };

    return (
        <Paper>
            <Box>
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
        </Paper>
    );
};

export default SortMenu;
