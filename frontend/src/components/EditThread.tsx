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

  const fetchAuthorization = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/threads/${id}/authorize?username=${username}`);
      if (!response.data.authorized) {
        navigate(`/threads/${id}`, { state: { error: "Unauthorized access!" } });
      }
    } catch {
      setError("Failed to verify authorization.");
    }
  };
  useEffect(() => {
    if (username) fetchAuthorization();
  }, [id, username, navigate]);

  
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
      alert(response.data.message); // Success message
      navigate(`/threads/${id}`); 
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // If the backend sends a validation error array
        setError(err.response.data.errors.join(", "));
      } else if (err.response?.data?.error) {
        // If the backend sends a single error message
        setError(err.response.data.error);
      } else {
        setError("Failed to edit thread.");
      }
    }
  };
  
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }
  

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h1>Edit Thread</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
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
