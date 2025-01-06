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
        <Card sx={cardStyles}>
            {/* Title Section */}
            {title && (
                <Box
                    sx={{
                        padding: 2,
                        display: "flex",
                        flexWrap: "wrap",
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: (theme) => theme.palette.primary.contrastText,
                        borderBottom: "1px solid #ddd",
                        textAlign: "center", // Center-align the title
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {title}
                    </Typography>
                </Box>
            )}

            {/* Content Section */}
            <CardContent
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    "&:last-child": { paddingBottom: 3 },
                }}
            >
                {/* Main Content */}
                {content}

                {/* Metadata Section */}
                {metadata && (
                    <Box sx={{ marginTop: 2, color: "text.primary", fontSize: "0.875rem" }}>
                        {metadata.author && (
                            <Typography variant="caption" display="block">
                                By:{" "}
                                <Link
                                    to={`/profile/${metadata.author}`}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                    onClick={(e) => e.stopPropagation()} // Prevent card click propagation
                                >
                                    {metadata.author}
                                </Link>
                            </Typography>
                        )}
                        {metadata.likes !== undefined && (
                            <Typography variant="caption" display="block">
                                👍 Likes: {metadata.likes}
                            </Typography>
                        )}
                        {metadata.dislikes !== undefined && (
                            <Typography variant="caption" display="block">
                                👎 Dislikes: {metadata.dislikes}
                            </Typography>
                        )}
                        {metadata.comments !== undefined && (
                            <Typography variant="caption" display="block">
                                💬 Comments: {metadata.comments}
                            </Typography>
                        )}
                        {metadata.createdAt && (
                            <Typography variant="caption" display="block">
                                📅 Created: <Timestamp date={metadata.createdAt} />
                            </Typography>
                        )}
                    </Box>
                )}

                {/* View Details Button */}
                {!metadata?.isMaxDepth && (
                    <CardActions sx={{ marginTop: 2 }}>
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

            {/* Children Section */}
            {children && (
                <Box
                    sx={{
                        padding: 2,
                        backgroundColor: "background.default",
                        borderTop: "1px solid #ddd",
                    }}
                >
                    {children}
                </Box>
            )}

            {/* Footer Section */}
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
