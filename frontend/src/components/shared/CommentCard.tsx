import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { cardStyles } from './Styles';
import Timestamp from './Timestamp';
import { Comment } from '../CommentList';

interface CustomCommentCardProps {
    thread: Comment;
    isMaxDepth: boolean;
    children?: React.ReactNode; // Add support for children
}

const CustomCommentCard: React.FC<CustomCommentCardProps> = ({ thread, isMaxDepth, children }) => {
    
    return (
        <Card sx={{ ...cardStyles }}>
            <CardContent>
                <Typography variant="body1" gutterBottom>
                    {!isMaxDepth ? (
                        <Link to={`/threads/${thread.id}`} style={{ textDecoration: 'none' }}>
                            {thread.content}
                        </Link>
                    ) : (
                        <span>{thread.content}</span> // Render as plain text if depth = 3
                    )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    By: {thread.author} | Likes: {thread.likesCount} | Dislikes: {thread.dislikesCount}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                    Posted: <Timestamp date={thread.createdAt} />
                </Typography>
                {children && <Box sx={{ marginTop: 2 }}>{children}</Box>}
            </CardContent>
        </Card>
    );
};

export default CustomCommentCard;
