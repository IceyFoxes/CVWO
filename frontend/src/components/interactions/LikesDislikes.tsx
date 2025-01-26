import React, { useEffect, useState } from "react";
import { PrimaryButton, DangerButton } from "../shared/Buttons";
import {
    getLikesCount,
    getDislikesCount,
    getLikeState,
    likeThread,
    dislikeThread,
    removeLike,
    removeDislike,
} from "../../services/interactionService";
import useInteraction from "../hooks/useInteraction";

const LikesDislikes: React.FC<{ threadId: string }> = ({ threadId }) => {
    const [likesCount, setLikesCount] = useState<number>(0);
    const [dislikesCount, setDislikesCount] = useState<number>(0);

    const likeHook = useInteraction({
        fetchState: (id, username) =>
            getLikeState(id, username).then((state) => ({
                isActive: state.liked,
                count: likesCount,
            })),
        onActivate: likeThread,
        onDeactivate: removeLike,
        successMessage: { activate: "Thread liked!", deactivate: "Like removed!" },
        threadId,
    });

    const dislikeHook = useInteraction({
        fetchState: (id, username) =>
            getLikeState(id, username).then((state) => ({
                isActive: state.disliked,
                count: dislikesCount,
            })),
        onActivate: dislikeThread,
        onDeactivate: removeDislike,
        successMessage: { activate: "Thread disliked!", deactivate: "Dislike removed!" },
        threadId,
    });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const likes = await getLikesCount(threadId);
                const dislikes = await getDislikesCount(threadId);
                setLikesCount(likes);
                setDislikesCount(dislikes);
            } catch (error) {
                console.error("Failed to fetch counts:", error);
            }
        };

        fetchCounts();
    }, [threadId, likeHook.isActive, dislikeHook.isActive]); // Refetch counts on state change

    return (
        <div>
            <div style={{ marginBottom: "10px" }}>
                <span>Likes: {likesCount}</span>
                <span style={{ marginLeft: "10px" }}>Dislikes: {dislikesCount}</span>
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
                <PrimaryButton onClick={likeHook.toggleInteraction}>
                    {likeHook.isActive ? "Unlike" : "Like"}
                </PrimaryButton>
                <DangerButton onClick={dislikeHook.toggleInteraction}>
                    {dislikeHook.isActive ? "Remove Dislike" : "Dislike"}
                </DangerButton>
            </div>
        </div>
    );
};

export default LikesDislikes;
