import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosConfig";

interface Comment {
    id: number;
    parent_id: number | null;
    author: string;
    content: string;
    created_at: string;
    likes_count: number;
    dislikes_count: number;
    children: Comment[]; // Always initialized as an empty array
}

// Utility to build comment hierarchy
const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();

    // Map comments by their ID and initialize children
    comments.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, children: [] });
    });

    const rootComments: Comment[] = [];

    // Assign children to their parents
    commentMap.forEach((comment) => {
        if (comment.parent_id !== null && commentMap.has(comment.parent_id)) {
            commentMap.get(comment.parent_id)?.children.push(comment);
        } else {
            rootComments.push(comment);
        }
    });

    return rootComments;
};

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
    const [showChildren, setShowChildren] = useState(true); // Default to expanded

    return (
        <li style={{ marginBottom: "10px", paddingLeft: `${comment.parent_id ? 20 : 0}px`, borderLeft: "1px solid #ccc" }}>
            <p>{comment.content}</p>
            <small>
                By: {comment.author} | Likes: {comment.likes_count} | Dislikes: {comment.dislikes_count}
            </small>
            <br />
            <small>Posted on: {new Date(comment.created_at).toLocaleString()}</small>
            <br />
            <Link to={`/threads/${comment.id}`} style={{ color: "blue" }}>
                View Details
            </Link>
            <br />
            {comment.children.length > 0 && (
                <button onClick={() => setShowChildren(!showChildren)}>
                    {showChildren ? "Collapse Replies" : "Expand Replies"}
                </button>
            )}
            {showChildren && (
                <ul>
                    {comment.children.map((child) => (
                        <CommentItem key={child.id} comment={child} />
                    ))}
                </ul>
            )}
        </li>
    );
};

const CommentList: React.FC<{ threadId: number; refreshFlag: boolean; searchQuery: string; sortBy: string }> = ({
    threadId,
    refreshFlag,
    searchQuery,
    sortBy,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axiosInstance.get(`/threads/${threadId}`, {
                    params: { query: searchQuery, sortBy },
                });
                const { comments } = response.data;
                if (Array.isArray(comments)) {
                    setComments(comments);
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (error) {
                console.error("Failed to fetch comments:", error);
                setError("Failed to load comments. Please try again.");
            }
        };
        fetchComments();
    }, [threadId, refreshFlag, searchQuery, sortBy]);

    const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (comments.length === 0) return <p>No comments yet...</p>;

    return (
        <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
            {commentTree.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </ul>
    );
};

export default CommentList;
