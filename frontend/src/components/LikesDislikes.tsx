import React, { useState, useEffect } from "react";
import axios from "axios";

const LikesDislikes: React.FC<{ threadId: number }> = ({ threadId }) => {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [dislikesCount, setDislikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [disliked, setDisliked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch likes and dislikes count
    axios
      .get(`http://localhost:8080/threads/${threadId}/likes`)
      .then((response) => setLikesCount(response.data.likes_count || 0))
      .catch((error) => setError("Failed to fetch likes count"));

    axios
      .get(`http://localhost:8080/threads/${threadId}/dislikes`)
      .then((response) => setDislikesCount(response.data.dislikes_count || 0))
      .catch((error) => setError("Failed to fetch dislikes count"));
  }, [threadId]);

  const toggleLike = () => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("You must be logged in to like a thread.");
      return;
    }

    if (liked) {
      axios
        .delete(`http://localhost:8080/threads/${threadId}/like?username=${username}`)
        .then(() => {
          setLiked(false);
          setLikesCount((prev) => prev - 1);
        })
        .catch(() => setError("Failed to remove like"));
    } else {
      axios
        .post(`http://localhost:8080/threads/${threadId}/like?username=${username}`)
        .then(() => {
          setLiked(true);
          setDisliked(false);
          setLikesCount((prev) => prev + 1);
          setDislikesCount((prev) => (disliked ? prev - 1 : prev));
        })
        .catch(() => setError("Failed to like thread"));
    }
  };

  const toggleDislike = () => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("You must be logged in to dislike a thread.");
      return;
    }

    if (disliked) {
      axios
        .delete(`http://localhost:8080/threads/${threadId}/dislike?username=${username}`)
        .then(() => {
          setDisliked(false);
          setDislikesCount((prev) => prev - 1);
        })
        .catch(() => setError("Failed to remove dislike"));
    } else {
      axios
        .post(`http://localhost:8080/threads/${threadId}/dislike?username=${username}`)
        .then(() => {
          setDisliked(true);
          setLiked(false);
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
