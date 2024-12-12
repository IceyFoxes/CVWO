import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditThread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/threads/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch thread:", err);
        setError("Failed to fetch thread details.");
      }
    };

    if (username) {
      fetchThread();
    } else {
      navigate("/login", { state: { message: "You must be logged in!" } });
    }
  }, [id, username, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:8080/threads/${id}?username=${username}`,
        { title, content }
      );
      alert(response.data.message);
      navigate(`/threads/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to edit thread.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Edit Thread</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditThread;
