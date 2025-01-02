import React from "react";
import { Card, CardContent, CardActions, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { cardStyles } from "./Styles";
import { PrimaryButton } from "./Buttons";
import Timestamp from "./Timestamp";

interface CustomCardProps {
    title?: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    linkTo: string;
    metadata?: {
        author?: string;
        likes?: number;
        comments?: number;
        dislikes?: number;
        createdAt?: string;
        isMaxDepth?: boolean;
    };
}

const CustomCard: React.FC<CustomCardProps> = ({ title, content, footer, linkTo, metadata, children }) => {
    const navigate = useNavigate();
    return (
        <Card
            sx={{
                ...cardStyles,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                cursor: "pointer",
                "&:hover": {
                    boxShadow: 10,
                },
            }}
        >
            {title && (
                <Box
                    sx={{
                        padding: 2,
                        backgroundColor: "primary.light",
                        borderBottom: "1px solid #ddd",
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                        {title}
                    </Typography>
                </Box>
            )}
            <CardContent
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    "&:last-child": { paddingBottom: 3 },
                }}
            >
                {content}
                {metadata && (
                    <>
                        {metadata.author && (
                            <Typography
                                variant="caption"
                                display="block"
                                sx={{
                                    pointerEvents: "auto", // Allow interaction for author link
                                }}
                                onClick={(e) => e.stopPropagation()} // Prevent card click propagation
                            >
                                By:{" "}
                                <Link
                                    to={`/profile/${metadata.author}`}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                >
                                    {metadata.author}
                                </Link>
                            </Typography>
                        )}
                        {metadata.likes !== undefined && (
                            <Typography variant="caption" display="block">
                                Likes: {metadata.likes}
                            </Typography>
                        )}
                        {metadata.dislikes !== undefined && (
                            <Typography variant="caption" display="block">
                                Dislikes: {metadata.dislikes}
                            </Typography>
                        )}
                        {metadata.comments !== undefined && (
                            <Typography variant="caption" display="block">
                                Comments: {metadata.comments}
                            </Typography>
                        )}
                        {metadata.createdAt && (
                            <Typography variant="caption" display="block">
                                Created: <Timestamp date={metadata.createdAt}></Timestamp>
                            </Typography>
                        )}
                    </>
                )}
                {!metadata?.isMaxDepth && (<CardActions>
                    <PrimaryButton
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(linkTo);
                        }}
                    >
                        View Details
                    </PrimaryButton>
                </CardActions>
                )} 
            </CardContent>
            
            {children && <Box sx={{ padding: 2 }}>{children}</Box>}
            
            {footer && (
                <CardActions
                    sx={{
                        padding: 2,
                        backgroundColor: "background.default",
                        borderTop: "1px solid #ddd",
                        justifyContent: "flex-end",
                    }}
                >
                    {footer}
                </CardActions>
            )}
        </Card>
    );
};

export default CustomCard;
