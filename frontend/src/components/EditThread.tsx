import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditThread: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the thread ID from the URL
  const navigate = useNavigate();

  const [thread, setThread] = useState<{ title: string; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        // Fetch the thread data from the backend
        const response = await axios.get(`http://localhost:8080/threads/${id}`);
        setThread(response.data);
      } catch (err) {
        setError("Failed to load thread data.");
      }
    };

    fetchThread();
  }, [id]); // Run effect when thread ID changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (thread) {
      try {
        // Sending the updated thread data along with the username
        const username = localStorage.getItem("username");
        if (!username) {
          alert("You must be logged in to edit this thread.");
          return;
        }

        await axios.put(`http://localhost:8080/threads/${id}?username=${username}`, {
          title: thread.title,
          content: thread.content
        });

        alert("Thread updated successfully!");
        navigate("/"); // Navigate back to the home page or thread list
      } catch (err) {
        setError("Failed to update thread.");
      }
    }
  };

  return (
    <div>
      <h1>Edit Thread</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {thread ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={thread.title}
              onChange={(e) => setThread({ ...thread, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Content:</label>
            <textarea
              value={thread.content}
              onChange={(e) => setThread({ ...thread, content: e.target.value })}
              required
            />
          </div>
          <button type="submit">Update Thread</button>
        </form>
      ) : (
        <p>Loading thread...</p>
      )}
    </div>
  );
};

export default EditThread;
