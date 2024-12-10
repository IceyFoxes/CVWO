import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


// Define the type for a Thread
interface Thread {
  id: number;
  title: string;
  content: string;
}

const ThreadList: React.FC = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const username = localStorage.getItem("username"); // Get the logged-in username from localStorage

  useEffect(() => {
    if (!username) {
      navigate("/login"); // Redirect to login page if not logged in
    } else {
      axios
        .get("http://localhost:8080/threads")
        .then((response) => {
          setThreads(response.data || []); // Adjust based on the backend response structure
          setLoading(false);
        })
        .catch((error) => {
          console.error("There was an error fetching the threads!", error);
          setError("Failed to fetch threads.");
          setLoading(false);
        });
    }
  }, [username, navigate]);

  // Delete Handler
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this thread?");
    if (!confirmed) return;
  
    try {
      // Send the delete request
      await axios.delete(`http://localhost:8080/threads/${id}?username=${username}`);
      alert("Thread deleted successfully!");
      // Remove the deleted thread from state
      setThreads(threads.filter((thread) => thread.id !== id));
    } catch (error: any) {
      // Generic error handling with fallback
      alert(error?.response?.data?.error || "Failed to delete thread.");
    }
  };

  // Edit Handler
  const handleEdit = (id: number) => {
    // Navigate to the Edit page for the selected thread
    navigate(`/threads/edit/${id}`);
  };
    
  
  return (
    <div>
      <h1>Threads</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading threads...</p>
      ) : (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>
              <h3>{thread.title}</h3>
              <p>{thread.content}</p>
              <div>
                <button onClick={() => handleEdit(thread.id)} style={{ color: "blue" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(thread.id)} style={{ color: "red" }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link to="/create">Create New Thread</Link>
    </div>
  );
};

export default ThreadList;

