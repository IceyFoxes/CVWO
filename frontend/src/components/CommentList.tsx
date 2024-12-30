import React, { useState, useEffect, useMemo } from "react";
import { getThreadById } from "../services/threadService";
import { useAlert } from "./contexts/AlertContext";
import { useRefresh } from "./contexts/RefreshContext";
import { Box, Typography } from "@mui/material";
import CustomCommentCard from "./shared/CommentCard";
import { PrimaryButton } from "./shared/Buttons";

export interface Comment {
    id: number;
    parentId: number | null;
    author: string;
    content: string;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
    depth: number;
    children: Comment[];
}

const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    comments.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, children: [] });
    });

    const rootComments: Comment[] = [];
    commentMap.forEach((comment) => {
        if (comment.parentId !== null && commentMap.has(comment.parentId)) {
            commentMap.get(comment.parentId)?.children.push(comment);
        } else {
            rootComments.push(comment);
        }
    });

    return rootComments;
};

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
    const [showChildren, setShowChildren] = useState(true);

    return (
        <CustomCommentCard thread={comment} isMaxDepth={comment.depth === 3}>
            {/* Toggle Replies */}
            <Box sx={{ marginTop: 1 }} onClick={(e) => e.stopPropagation()}>
                {comment.children.length > 0 && (
                    <PrimaryButton
                        onClick={() => setShowChildren(!showChildren)}
                        style={{ marginLeft: 8 }}
                    >
                        {showChildren ? "Collapse Replies" : "Expand Replies"}
                    </PrimaryButton>
                )}
            </Box>

            {/* Render Children */}
            {showChildren && (
                <Box sx={{ paddingLeft: 2 }}>
                    {comment.children.map((child) => (
                        <CommentItem key={child.id} comment={child} />
                    ))}
                </Box>
            )}
        </CustomCommentCard>
    );
};

const CommentList: React.FC<{ threadId: string; searchQuery: string; sortBy: string }> = ({
    threadId,
    searchQuery,
    sortBy,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const { refreshFlag } = useRefresh();
    const { showAlert } = useAlert();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await getThreadById(threadId.toString(), { query: searchQuery, sortBy });

                const { comments } = data;
                if (Array.isArray(comments)) {
                    setComments(comments);
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (error: any) {
                console.error("Failed to fetch comments:", error);
                showAlert("Failed to load comments. Please try again.", "error");
            }
        };
        fetchComments();
    }, [threadId, refreshFlag, searchQuery, sortBy, showAlert]);

    const commentTree = useMemo(() => {
        return buildCommentTree(comments);
    }, [comments]);

    if (comments.length === 0) {
        return <Typography>No comments yet...</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            {commentTree.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </Box>
    );
};

export default CommentList;
