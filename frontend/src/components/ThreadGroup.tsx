import React from "react";
import { Box, Typography } from "@mui/material";
import CustomCard from "./shared/Card";
import { Thread } from "../components/CategoryGroup";

interface ThreadGroupProps {
    tag: string;
    threads: Thread[];
}

const ThreadGroup: React.FC<ThreadGroupProps> = ({ tag, threads }) => {
    return (
        <Box sx={{ marginBottom: 4 }}>
            <Typography variant="h5" gutterBottom>
                {tag}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {threads.map((thread) => (
                    <CustomCard key={thread.id} thread={thread} />
                ))}
            </Box>
        </Box>
    );
};

export default ThreadGroup;
