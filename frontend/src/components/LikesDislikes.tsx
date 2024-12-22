import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const LikesDislikes: React.FC<{ threadId: number }> = ({ threadId }) => {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [dislikesCount, setDislikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [disliked, setDisliked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const username = sessionStorage.getItem("username");

  useEffect(() => {
    // Fetch likes and dislikes count
    axiosInstance
      .get(`/threads/${threadId}/likes`)
      .then((response) => setLikesCount(response.data.likes_count || 0))
      .catch(() => setError("Failed to fetch likes count"));

    axiosInstance
      .get(`/threads/${threadId}/dislikes`)
      .then((response) => setDislikesCount(response.data.dislikes_count || 0))
      .catch(() => setError("Failed to fetch dislikes count"));

    // Fetch user's interaction state
    if (username) {
      axiosInstance
        .get(`/threads/${threadId}/interaction`, {
          params: { username },
        })
        .then((response) => {
          setLiked(response.data.liked || false);
          setDisliked(response.data.disliked || false);
        })
        .catch(() => setError("Failed to fetch interaction state"));
    }
  }, [threadId, username]);

  const toggleLike = () => {
    if (!username) {
      alert("You must be logged in to like a thread.");
      return;
    }

    if (liked) {
      axiosInstance
        .delete(`/threads/${threadId}/like`, {
          params: { username },
        })
        .then(() => {
          setLiked(false);
          setLikesCount((prev) => prev - 1);
        })
        .catch(() => setError("Failed to remove like"));
    } else {
      axiosInstance
        .post(`/threads/${threadId}/like`, null, {
          params: { username },
        })
        .then(() => {
          setLiked(true);
          setDisliked(false); // Remove dislike if it exists
          setLikesCount((prev) => prev + 1);
          setDislikesCount((prev) => (disliked ? prev - 1 : prev));
        })
        .catch(() => setError("Failed to like thread"));
    }
  };

  const toggleDislike = () => {
    if (!username) {
      alert("You must be logged in to dislike a thread.");
      return;
    }

    if (disliked) {
      axiosInstance
        .delete(`/threads/${threadId}/dislike`, {
          params: { username },
        })
        .then(() => {
          setDisliked(false);
          setDislikesCount((prev) => prev - 1);
        })
        .catch(() => setError("Failed to remove dislike"));
    } else {
      axiosInstance
        .post(`/threads/${threadId}/dislike`, null, {
          params: { username },
        })
        .then(() => {
          setDisliked(true);
          setLiked(false); // Remove like if it exists
          setDislikesCount((prev) => prev + 1);
          setLikesCount((prev) => (liked ? prev - 1 : prev));
        })
        .catch(() => setError("Failed to dislike thread"));
    }
  };

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
