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
                <Box sx={{ paddingLeft: 2, paddingTop: 2 }}>
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
            showAlert("You must be logged in to comment.", "warning");
            return;
        }

        if (!commentContent.trim()) {
            showAlert("Comment content cannot be empty.", "warning");
            return;
        }

        try {
            await postComment(id, username, commentContent);
            showAlert("Comment added successfully.", "success");
            setCommentContent("");
            setShowCommentBox(false);
            triggerRefresh();
        } catch (err: any) {
            let errorMessage = "An error occurred while creating the thread.";

            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.errors) {
                errorMessage = err.response.data.errors.join(", ");
            }

            showAlert(errorMessage, "error");
        }
    };

    const sortedComments = useMemo(() => {
        const filtered = comments.filter((comment) =>
            comment.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "createdAt":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "likes":
                    return b.likesCount - a.likesCount;
                case "dislikes":
                    return b.dislikesCount - a.dislikesCount;
                default:
                    return 0;
            }
        });
    
        return filtered;
    }, [comments, searchQuery, sortBy]);    

    const commentTree = useMemo(() => buildCommentTree(sortedComments), [sortedComments]);

    if (error) return <Typography color="error">{error}</Typography>;
    if (!thread) return <Loader />;

    return (
        <Layout>
            {/* Go to Parent Thread Button */}
            {thread.parentId && (
                <PrimaryButton
                    variant="outlined"
                    color="primary"
                    onClick={navigateToParent}
                    sx={{
                        marginBottom: 2,
                        fontSize: { xs: "0.875rem", sm: "1rem" }, // Responsive font size
                        padding: { xs: "6px 12px", sm: "8px 16px" },
                    }}
                >
                    Go to Parent Thread
                </PrimaryButton>
            )}

            {/* Thread Content */}
            <Box
                sx={{
                    backgroundColor: (theme) => theme.palette.background.paper,
                    borderRadius: "8px",
                    padding: { xs: 2, sm: 4 },
                    boxShadow: 3,
                    marginBottom: 4,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        flexWrap: "wrap", 
                        gap: 2, 
                        marginBottom: 2,
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: "bold",
                            fontSize: { xs: "1.5rem", sm: "2rem" },
                        }}
                    >
                        {thread.title}
                    </Typography>
                    {username && thread.title && (
                        <SaveUnsave threadId={id}/>
                    )}
                </Box>

                <Typography
                    variant="body1"
                    sx={{
                        marginBottom: 2,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        color: "text.primary",
                    }}
                >
                    {thread.content}
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        display: "block",
                        marginBottom: 2,
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    Posted by{" "}
                    <Link
                        to={`/profile/${thread.author}`}
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        {thread.author}
                    </Link>{" "}
                    <Timestamp date={thread.createdAt} />
                </Typography>

                {/* Likes and Save Buttons */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        marginBottom: 2,
                    }}
                >
                    <LikesDislikes threadId={id} />
                </Box>

                {/* Edit and Delete Buttons */}
                {authorized && (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            marginTop: 2,
                        }}
                    >
                        <PrimaryButton onClick={openModal}>Edit</PrimaryButton>
                        <UpdateThread open={isOpen} onClose={closeModal} threadId={id} />
                        <DeleteThread threadId={id} authorized={authorized} />
                    </Box>
                )}
            </Box>

            {/* Comments Section */}
            <Box
                sx={{
                    marginTop: 4,
                    backgroundColor: (theme) => theme.palette.background.default,
                    borderRadius: "8px",
                    padding: { xs: 2, sm: 4 },
                    boxShadow: 2,
                }}
            >
                {/* Search and Sort */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 2,
                    }}
                >
                    <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                    <SortMenu
                        sortBy={sortBy}
                        onSortChange={(field) =>
                            setSortBy(field as "createdAt" | "likes" | "dislikes")
                        }
                        excludedOptions={["comments"]}
                    />
                </Box>

                {/* Add Comment Section */}
                {showCommentBox && (
                    <Box sx={{ marginBottom: 4 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write your comment here..."
                            sx={{
                                marginBottom: 2,
                                backgroundColor: "background.paper",
                                borderRadius: "4px",
                                boxShadow: 1,
                            }}
                        />
                        <PrimaryButton
                            onClick={handleCommentSubmit}
                            sx={{
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                            }}
                        >
                            Submit Comment
                        </PrimaryButton>
                    </Box>
                )}

                {/* Toggle Comment Box Button */}
                {username && (
                    <PrimaryButton
                        onClick={() => setShowCommentBox(!showCommentBox)}
                        sx={{
                            marginBottom: 4,
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                    >
                        {showCommentBox ? "Cancel Comment" : "Add Comment"}
                    </PrimaryButton>
                 )}

                {/* Comments Title */}
                <Typography
                    variant="h6"
                    sx={{
                        marginTop: 4,
                        marginBottom: 2,
                        fontWeight: "bold",
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                >
                    Comments
                </Typography>

                {/* Comments */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, // Responsive grid
                        gap: 2,
                    }}
                >
                    {commentTree.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </Box>
            </Box>
        </Layout>

    );
};

export default ThreadDetails;
