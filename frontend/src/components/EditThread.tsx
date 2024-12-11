import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditThread: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the thread ID from the URL
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        // Fetch the thread data from the backend
        const response = await axios.get(`http://localhost:8080/threads/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
      } catch (err) {
        setError("Failed to load thread data.");
      }
    };

    fetchThread();
  }, [id]); // Run effect when thread ID changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const username = localStorage.getItem("username");
      const response = await axios.put(
        `http://localhost:8080/threads/${id}?username=${username}`,
        { title, content }
      );
      const updatedThread = response.data;
      console.log(updatedThread);
      alert("Thread updated successfully!");
      navigate("/"); // Navigate back to the home page or thread list
    } catch (err: any) {
      if (err.response) {
        const errors = err.response.data.errors || [err.response.data.error];
        alert(errors.join("\n")); // Show backend validation errors
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };  

  return (
    <div>
      <h1>Edit Thread</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Thread</button>
      </form>
    </div>
  );
};

export default EditThread;
