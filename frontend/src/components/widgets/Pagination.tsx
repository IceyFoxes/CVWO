import React from "react";
import { Box } from "@mui/material";
import { PrimaryButton, OutlinedButton } from "../shared/Buttons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
            <PrimaryButton onClick={handlePrevious} disabled={currentPage === 1}>
                Previous
            </PrimaryButton>
            <OutlinedButton disabled>
                Page {currentPage} of {totalPages}
            </OutlinedButton>
            <PrimaryButton onClick={handleNext} disabled={currentPage === totalPages}>
                Next
            </PrimaryButton>
        </Box>
    );
};

export default Pagination;
