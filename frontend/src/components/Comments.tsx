import React, { useState, useEffect } from "react";
import axios from "axios";

interface Comment {
  id: number;
  content: string;
  username: string;
  created_at: string;
}

const Comments: React.FC<{ threadId: number }> = ({ threadId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch comments
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8080/threads/${threadId}/comments`)
      .then((response) => {
        setComments(response.data.comments || []); // Default to empty array if no comments
        setError(null); // Clear previous errors
      })
      .catch((error) => {
        console.error("Failed to fetch comments:", error);
        setError("Failed to fetch comments.");
      })
      .finally(() => setLoading(false));
  }, [threadId]);

  // Add new comment
  const addComment = () => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("You must be logged in to comment.");
      return;
    }

    axios
      .post(
        `http://localhost:8080/threads/${threadId}/comments?username=${username}`,
        { content: newComment }
      )
      .then(() => {
        setNewComment("");
        // Refresh comments after successful addition
        setLoading(true);
        axios
          .get(`http://localhost:8080/threads/${threadId}/comments`)
          .then((response) => setComments(response.data.comments || []))
          .catch((error) => console.error("Failed to fetch comments:", error))
          .finally(() => setLoading(false));
      })
      .catch((error) => {
        console.error("Failed to add comment:", error);
        alert("Failed to add comment.");
      });
  };

  return (
    <div>
      <h4>Comments</h4>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>
                <strong>{comment.username}</strong>: {comment.content}
              </p>
              <small>{new Date(comment.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
      ></textarea>
      <button onClick={addComment}>Submit</button>
    </div>
  );
};

export default Comments;
