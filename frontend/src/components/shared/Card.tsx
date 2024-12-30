import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Chip, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { cardStyles } from './Styles';
import { Thread } from '../CategoryGroup';

interface CustomCardProps {
    thread: Thread;
}

const CustomCard: React.FC<CustomCardProps> = ({ thread }) => {
    return (
        <Card sx={{ ...(cardStyles as any) }}>
            <CardContent>
                {/* Thread Title */}
                <Typography variant="h6" component="div" gutterBottom>
                    {thread.title}
                </Typography>

                {/* Thread Content Preview */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {thread.content.length > 100
                        ? `${thread.content.substring(0, 100)}...`
                        : thread.content}
                </Typography>

                {/* Thread Author */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Posted by {" "}
                    <Link
                        to={`/profile/${thread.author}`} 
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        {thread.author}
                    </Link>
                </Typography>

                {/* Likes, Comments */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                    <Typography variant="caption">Likes: {thread.likesCount}</Typography>
                    <Typography variant="caption">Comments: {thread.commentsCount}</Typography>
                </Box>

                {/* Tags */}
                <Box sx={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {thread.tag && <Chip key={thread.tag} label={thread.tag} size="small" />}
                </Box>
            </CardContent>

            <CardActions>
                {/* View Thread Button */}
                <Button size="small" component={Link} to={`/threads/${thread.id}`}>
                    View Details
                </Button>
            </CardActions>
        </Card>
    );
};

export default CustomCard;
