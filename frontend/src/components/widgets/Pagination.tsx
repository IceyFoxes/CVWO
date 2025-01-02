import React from "react";
import { Box, Button } from "@mui/material";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <Button
                    key={i}
                    onClick={() => onPageChange(i)}
                    disabled={i === currentPage}
                    sx={{ marginX: 0.5 }}
                >
                    {i}
                </Button>
            );
        }
        return pages;
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, marginTop: 2 }}>
            <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
            </Button>
            {renderPageNumbers()}
            <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
            </Button>
        </Box>
    );
};

export default Pagination;
