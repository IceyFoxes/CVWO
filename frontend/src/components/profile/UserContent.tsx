import React from "react";
import { Typography, Paper, Divider, useTheme } from "@mui/material";
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
  const theme = useTheme();

  return (
    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
      {/* Title Section */}
      {title && (
        <Typography
          variant="h6"
          component={Link}
          to={threadLink}
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
            marginBottom: 1,
          }}
        >
          {title}
        </Typography>
      )}

      {/* Content Section */}
      <Typography
        variant="body1"
        component={Link}
        to={threadLink}
        sx={{
          textDecoration: "none",
          color: "inherit",
          marginBottom: 2,
          display: "block",
        }}
      >
        {content}
      </Typography>

      <Divider sx={{ marginY: 2 }} />

      {/* Metadata Section */}
      <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
        <Link
          to={profileLink}
          style={{
            textDecoration: "none",
            fontWeight: "bold",
            color: theme.palette.secondary.contrastText, 
          }}
        >
          {author}
        </Link>
        {parentAuthor && parentProfileLink && (
          <span>
            {` • Replied to `}
            <Link
              to={parentProfileLink}
              style={{
                textDecoration: "none",
                fontWeight: "bold",
                color: theme.palette.secondary.contrastText, 
              }}
            >
              {parentAuthor}
            </Link>
          </span>
        )}
        {` • ${formattedDate}`}
      </Typography>
    </Paper>
  );
};

export default ContentItem;

