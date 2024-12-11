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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const username = localStorage.getItem("username");
  
    // Fetch threads function
    const fetchThreads = async (search: string = "", pageNumber: number = 1, sort: string = "asc") => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/threads", {
          params: {
            search,
            page: pageNumber,
            limit: 3,
            sortBy: "title",
            sortOrder: sort,
          },
        });
  
        // Assuming backend returns an array of threads and totalPages in response.data
        setThreads(response.data.threads || []);
        setTotalPages(response.data.totalPages || 1);
        setError(null); // Clear previous errors
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setError("Failed to fetch threads.");
        setThreads([]); // Clear threads if there was an error
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!username) {
      navigate("/login", { state: { message: "You must be logged in!" } });
      return;
    }
  
    // Fetch threads only if the user is logged in
    fetchThreads();
  }, [username, navigate]); // Only re-run this effect if `username` or `navigate` changes

  // Handle search submission
  const handleSearch = () => {
    setPage(1); // Reset to the first page for a new search
    fetchThreads(searchQuery, 1, sortOrder);
  };

  // Handle pagination
  const nextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchThreads(searchQuery, nextPage, sortOrder);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchThreads(searchQuery, prevPage, sortOrder);
    }
  };

  // Handle sorting
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    fetchThreads(searchQuery, page, newSortOrder); // Refetch threads with new sort order
  };

  // Delete Handler
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this thread?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8080/threads/${id}?username=${username}`);
      alert("Thread deleted successfully!");
      fetchThreads(searchQuery, page, sortOrder); // Refetch threads after deletion
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Failed to delete thread.";
      alert(errorMessage);
    }
  };

  // Edit Handler
  const handleEdit = async (id: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/threads/${id}/authorize?username=${username}`);
      if (response.data.authorized) {
        navigate(`/threads/edit/${id}`);
      } else {
        alert(response.data.error || "You are not authorized to edit this thread.");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Failed to check authorization.";
      alert(errorMessage);
    }
  };

  return (
    <div>
      <h1>Threads</h1>

      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search threads"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Sort Dropdown */}
      <div>
        <select onChange={handleSortChange} value={sortOrder}>
          <option value="asc">Sort by Title (Ascending)</option>
          <option value="desc">Sort by Title (Descending)</option>
        </select>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading threads...</p>
      ) : threads.length === 0 ? (
        <p>No threads found.</p>
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

      {/* Pagination */}
      <div>
        <button onClick={prevPage} disabled={page <= 1}>
          Previous
        </button>
        <span>
          {" "}
          Page {page} of {totalPages}{" "}
        </span>
        <button onClick={nextPage} disabled={page >= totalPages}>
          Next
        </button>
      </div>

      {/* Link to Create Thread */}
      <Link to="/create">Create New Thread</Link>
    </div>
  );
};

export default ThreadList;
