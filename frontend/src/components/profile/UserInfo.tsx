import React from "react";
import { Box, Typography } from "@mui/material";

interface UserInfoProps {
    username: string;
    joinDate: string;
    role: string;
    bio: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ username, joinDate, role, bio }) => {
    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4">{username}</Typography>
            <Typography variant="body1">Joined: {new Date(joinDate).toLocaleDateString()}</Typography>
            <Typography variant="body2">
                Role: {role}
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
                {bio}
            </Typography>
        </Box>
    );
};

export default UserInfo;
