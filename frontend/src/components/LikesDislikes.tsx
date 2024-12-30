import React, { useState, useEffect } from "react";
import {
    getLikesCount,
    getDislikesCount,
    getLikeState,
    likeThread,
    dislikeThread,
    removeLike,
    removeDislike,
} from "../services/interactionService";
import { PrimaryButton, DangerButton } from "./shared/Buttons";
import { useAlert } from "./contexts/AlertContext";

const LikesDislikes: React.FC<{ threadId: string }> = ({ threadId }) => {
    const username = sessionStorage.getItem("username");
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showAlert } = useAlert();

    const fetchInteractionData = async () => {
        if (!username) return;
        try {
            const [likes, dislikes, LikeState] = await Promise.all([
                getLikesCount(threadId),
                getDislikesCount(threadId),
                getLikeState(threadId, username),
            ]);
            setLikesCount(likes);
            setDislikesCount(dislikes);
            setLiked(LikeState.liked);
            setDisliked(LikeState.disliked);
        } catch (err) {
            console.error("Error fetching interaction data:", err);
            setError("Failed to fetch likes/dislikes. Please try again.");
        }
    };

    const handleLikeToggle = async () => {
        if (!username) {
            showAlert("You must be logged in to like a thread.", "error");
            return;
        }
        try {
            if (liked) {
                await removeLike(threadId, username);
                setLikesCount(likesCount - 1);
                setLiked(false);
            } else {
                await likeThread(threadId, username);
                setLikesCount(likesCount + 1);
                setLiked(true);

                if (disliked) {
                    await removeDislike(threadId, username);
                    setDislikesCount(dislikesCount - 1);
                    setDisliked(false);
                }
            }
        } catch (err) {
            console.error("Error toggling like:", err);
            setError("Failed to toggle like. Please try again.");
        }
    };

    const handleDislikeToggle = async () => {
        if (!username) {
            showAlert("You must be logged in to dislike a thread.", "error");
            return;
        }
        try {
            if (disliked) {
                await removeDislike(threadId, username ?? "");
                setDislikesCount(dislikesCount - 1);
                setDisliked(false);
            } else {
                await dislikeThread(threadId, username ?? "");
                setDislikesCount(dislikesCount + 1);
                setDisliked(true);

                if (liked) {
                    await removeLike(threadId,username ?? "");
                    setLikesCount(likesCount - 1);
                    setLiked(false);
                }
            }
        } catch (err) {
            console.error("Error toggling dislike:", err);
        }
    };

    useEffect(() => {
        fetchInteractionData();
    }, [threadId]);

    return (
        <div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</p>
            <p>{dislikesCount} {dislikesCount === 1 ? "Dislike" : "Dislikes"}</p>
            <PrimaryButton onClick={handleLikeToggle} sx={{ color: liked ? "green" : "black" }}>
                {liked ? "Unlike" : "Like"}
            </PrimaryButton>
            <DangerButton onClick={handleDislikeToggle} sx={{ color: disliked ? "red" : "black" }}>
                {disliked ? "Remove Dislike" : "Dislike"}
            </DangerButton>
        </div>
    );
};

export default LikesDislikes;
