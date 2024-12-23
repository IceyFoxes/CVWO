import { useState, useEffect } from "react";
import {
    getLikesCount,
    getDislikesCount,
    getInteractionState,
    likeThread,
    dislikeThread,
    removeLike,
    removeDislike,
} from "../services/interactionService";

const useLikesDislikes = (threadId: number, username: string | null) => {
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const likes = await getLikesCount(threadId);
                const dislikes = await getDislikesCount(threadId);
                setLikesCount(likes);
                setDislikesCount(dislikes);

                if (username) {
                    const interaction = await getInteractionState(threadId, username);
                    setLiked(interaction.liked || false);
                    setDisliked(interaction.disliked || false);
                }
            } catch {
                setError("Failed to fetch likes/dislikes or interaction state.");
            }
        };
        fetchData();
    }, [threadId, username]);

    const toggleLike = async () => {
        if (!username) {
            alert("You must be logged in to like a thread.");
            return;
        }

        try {
            if (liked) {
                await removeLike(threadId, username);
                setLiked(false);
                setLikesCount((prev) => prev - 1);
            } else {
                await likeThread(threadId, username);
                setLiked(true);
                setDisliked(false);
                setLikesCount((prev) => prev + 1);
                setDislikesCount((prev) => (disliked ? prev - 1 : prev));
            }
        } catch {
            setError("Failed to toggle like.");
        }
    };

    const toggleDislike = async () => {
        if (!username) {
            alert("You must be logged in to dislike a thread.");
            return;
        }

        try {
            if (disliked) {
                await removeDislike(threadId, username);
                setDisliked(false);
                setDislikesCount((prev) => prev - 1);
            } else {
                await dislikeThread(threadId, username);
                setDisliked(true);
                setLiked(false);
                setDislikesCount((prev) => prev + 1);
                setLikesCount((prev) => (liked ? prev - 1 : prev));
            }
        } catch {
            setError("Failed to toggle dislike.");
        }
    };

    return { likesCount, dislikesCount, liked, disliked, error, toggleLike, toggleDislike };
};

export default useLikesDislikes;
