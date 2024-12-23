import React from "react";
import useLikesDislikes from "../hooks/useLikesDislikes";

const LikesDislikes: React.FC<{ threadId: number }> = ({ threadId }) => {
    const username = sessionStorage.getItem("username");
    const {
        likesCount,
        dislikesCount,
        liked,
        disliked,
        error,
        toggleLike,
        toggleDislike,
    } = useLikesDislikes(threadId, username);

    return (
        <div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</p>
            <p>{dislikesCount} {dislikesCount === 1 ? "Dislike" : "Dislikes"}</p>
            <button onClick={toggleLike} style={{ color: liked ? "green" : "black" }}>
                {liked ? "Unlike" : "Like"}
            </button>
            <button onClick={toggleDislike} style={{ color: disliked ? "red" : "black" }}>
                {disliked ? "Remove Dislike" : "Dislike"}
            </button>
        </div>
    );
};

export default LikesDislikes;
