import React, { useState, useEffect } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

interface LoaderProps {
    initialMessage?: string;
    longWaitMessage?: string;
    longWaitThreshold?: number;
}

const Loader: React.FC<LoaderProps> = ({
    initialMessage = "Loading...",
    longWaitMessage = "Please be patient... Waking up the backend now!",
    longWaitThreshold = 3000, 
}) => {
    const [message, setMessage] = useState(initialMessage);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMessage(longWaitMessage);
        }, longWaitThreshold);

        return () => clearTimeout(timer); 
    }, [longWaitMessage, longWaitThreshold]);

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
