import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "../components/shared/Buttons";
import LikesDislikes from "../components/interactions/LikesDislikes";
import SaveUnsave from "../components/interactions/SaveUnsave";
import Timestamp from "../components/shared/Timestamp";
import Loader from "../components/shared/Loader";
import Layout from "../components/layouts/Layout";
import SearchBar from "../components/widgets/SearchBar";
import SortMenu from "../components/widgets/SortMenu";
import CustomCard from "../components/shared/Card";
import DeleteThread from "../components/modals/DeleteThread";
import UpdateThread from "../components/modals/UpdateThread";
import { postComment, getThreadById, getThreadAuthorization } from "../services/threadService";
import { useAuth } from "../components/contexts/AuthContext";
import { useAlert } from "../components/contexts/AlertContext";
import { useRefresh } from "../components/contexts/RefreshContext";
import { useModal } from "../components/hooks/useModal";
import { inputStyles } from "../components/shared/Styles";
import { Thread } from "./HomePage";

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
        <CustomCard
            content={comment.content}
            linkTo={`/threads/${comment.id}`}
            metadata={{
                author: comment.author,
                likes: comment.likesCount,
                dislikes: comment.dislikesCount,
                createdAt: comment.createdAt,
                isMaxDepth: comment.depth === 3,
            }}
        >
            <Box onClick={(e) => e.stopPropagation()}>
                {comment.children.length > 0 && (
                    <PrimaryButton
                        onClick={() => setShowChildren(!showChildren)}
                        style={{ marginLeft: 8 }}
                    >
                        {showChildren ? "Collapse Replies" : "Expand Replies"}
                    </PrimaryButton>
                )}
            </Box>

            {showChildren && (
                <Box sx={{ paddingLeft: 2 }}>
                    {comment.children.map((child) => (
                        <CommentItem key={child.id} comment={child} />
                    ))}
                </Box>
            )}
        </CustomCard>
    );
};

const ThreadDetails: React.FC = () => {
    const { id = "" } = useParams<{ id: string }>();
    const [thread, setThread] = useState<Thread | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<"createdAt" | "likes" | "dislikes">("createdAt");
    const [showCommentBox, setShowCommentBox] = useState(false);

    const { isOpen, openModal, closeModal } = useModal();
    const { username } = useAuth();
    const { showAlert } = useAlert();
    const { triggerRefresh, refreshFlag } = useRefresh();
    const navigate = useNavigate();

    const navigateToParent = () => {
        if (thread?.parentId) {
            navigate(`/threads/${thread.parentId}`);
        }
    };

    const fetchThreadDetails = useCallback(async () => {
        try {
            setError(null);
            const data = await getThreadById(id);
            setThread(data.thread);
            setComments(data.comments || []);
            const authResponseData = await getThreadAuthorization(id, username);
            setAuthorized(authResponseData.authorized || false);
        } catch (error) {
            console.error("Failed to fetch thread details:", error);
            setError("Failed to load thread details. Please try again.");
        }
    }, [id, username]);

    useEffect(() => {
        fetchThreadDetails();
    }, [fetchThreadDetails, refreshFlag]);

    const handleCommentSubmit = async () => {
        if (!username) {
            showAlert("You must be logged in to comment.", "error");
            return;
        }

        if (!commentContent.trim()) {
            showAlert("Comment content cannot be empty.", "error");
            return;
        }

        try {
            await postComment(id, username, commentContent);
            showAlert("Comment added successfully.", "success");
            setCommentContent("");
            setShowCommentBox(false);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to add comment:", error);
            showAlert("Failed to add comment. Please try again.", "error");
        }
    };

    const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

    if (error) return <Typography color="error">{error}</Typography>;
    if (!thread) return <Loader />;

    return (
        <Layout>
            {thread.parentId && (
                <PrimaryButton
                    variant="outlined"
                    color="primary"
                    onClick={navigateToParent}
                    style={{ marginBottom: "16px" }}
                >
                    Go to Parent Thread
                </PrimaryButton>
            )}

            <Box>
                <Typography variant="h4">{thread.title}</Typography>
                <Typography variant="body1">{thread.content}</Typography>

                <Typography variant="caption">
                    Posted by{" "}
                    <Link
                        to={`/profile/${thread.author}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        {thread.author}
                    </Link>{" "}
                    <Timestamp date={thread.createdAt} />
                </Typography>

                <LikesDislikes threadId={id} />

                {username && <SaveUnsave threadId={id} />}

                {authorized && (
                    <Box>
                        <PrimaryButton onClick={openModal}>Edit</PrimaryButton>
                        <UpdateThread open={isOpen} onClose={closeModal} threadId={id} />
                        <DeleteThread threadId={id} authorized={authorized} />
                    </Box>
                )}

                <Box sx={{ marginTop: 4 }}>
                    <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                    <SortMenu
                        sortBy={sortBy}
                        onSortChange={(field) => setSortBy(field as "createdAt" | "likes" | "dislikes")}
                    />

                    {showCommentBox && (
                        <Box sx={{ marginBottom: 4 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="Write your comment here..."
                                sx={inputStyles}
                            />
                            <PrimaryButton onClick={handleCommentSubmit} sx={{ marginTop: 2 }}>
                                Submit Comment
                            </PrimaryButton>
                        </Box>
                    )}

                    <PrimaryButton onClick={() => setShowCommentBox(!showCommentBox)}>
                        {showCommentBox ? "Cancel Comment" : "Add Comment"}
                    </PrimaryButton>

                    <Typography variant="h6" sx={{ marginTop: 4, marginBottom: 2 }}>
                        Comments
                    </Typography>
                    {commentTree.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </Box>
            </Box>
        </Layout>
    );
};

export default ThreadDetails;
