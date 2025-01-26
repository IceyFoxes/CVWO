import React from "react";
import { Box, Paper, TextField } from "@mui/material";
import { inputStyles } from "../shared/Styles";

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
    return (
        <Paper>
            <Box>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search for items..."
                    sx={inputStyles}
                />
            </Box>
        </Paper>
    );
};

export default SearchBar;
