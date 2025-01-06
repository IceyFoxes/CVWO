import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { Link } from "react-router-dom";

interface ContentItemProps {
  id: number;
  title?: string;
  content: string;
  author: string;
  parentAuthor?: string;
  createdAt: string;
}

const ContentItem: React.FC<ContentItemProps> = ({ id, title, content, author, parentAuthor, createdAt }) => {
    const threadLink = `/threads/${id}`;
    const profileLink = `/profile/${author}`;
    const parentProfileLink = parentAuthor ? `/profile/${parentAuthor}` : null;
    const formattedDate = new Date(createdAt).toLocaleString();
  
    return (
    <Box sx={{ mb: 2 }}>
      {/* Navigate to Thread/Comment via ID */}
      {title && (
        <Typography
          variant="h6"
          sx={{ mb: 1 }}
          component={Link}
          to={threadLink}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {title}
        </Typography>
      )}
        <br></br>
        
        {/* Content */}
        <Typography
            variant="body1"
            component={Link}
            to={threadLink}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            {content}
        </Typography>

        {/* Metadata */}
        <Typography variant="body2" color="text.primary">
            <Link
            to={profileLink}
            style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
            >
            {author}
            </Link>
            {parentAuthor && parentProfileLink && (
            <span>
                {` • Replied to `}
                <Link
                to={parentProfileLink}
                style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
                >
                {parentAuthor}
                </Link>
            </span>
            )}
            {` • ${formattedDate}`}
        </Typography>

        <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default ContentItem;

