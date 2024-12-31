import React from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

const Loader: React.FC<{ message?: string }> = ({ message = "Please be patient ;-; Render Backend will sleep after inactivity... Waking up now..." }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                gap: 2,
            }}
        >
            <CircularProgress color="primary" size={50} />
            <Typography variant="body1" color="textSecondary">
                {message}
            </Typography>
        </Box>
    );
};

export default Loader;
