import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DeleteThread from "./DeleteThread";
import Search from "./Search"; 
import Sort from "./Sort"; 
import Pagination from "./Pagination";
import Timestamp from "./Timestamp";

interface Thread {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const ThreadList: React.FC = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState("created_at"); // Default to sorting by time (newest first)
  const [sortOrder, setSortOrder] = useState("desc"); // Default order is descending

  const username = localStorage.getItem("username");

  // Fetch threads function
  const fetchThreads = useCallback(
    async (search: string = "", pageNumber: number = 1, sort: string = "asc") => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/threads", {
          params: {
            search,
            page: pageNumber,
            limit: 3,
            sortBy,
            sortOrder,
          },
        });

        setThreads(response.data.threads || []);
        setTotalPages(response.data.totalPages || 1);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setError("Failed to fetch threads.");
        setThreads([]);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder]
  );

  useEffect(() => {
    if (!username) {
      navigate("/login", { state: { message: "You must be logged in!" } });
      return;
    }
    fetchThreads();
  }, [username, fetchThreads, navigate]);

  const handleThreadDeleted = (threadId: number) => {
    setThreads((prevThreads) => prevThreads.filter((thread) => thread.id !== threadId));
  };

  return (
    <div>
      <h1>Threads</h1>

      <Search 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        fetchThreads={fetchThreads} 
        sortOrder={sortOrder} 
      />
      <Sort
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        fetchThreads={fetchThreads}
        searchQuery={searchQuery}
        page={page}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading threads...</p>
      ) : (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>
              <h3>{thread.title}</h3>
              <p>{thread.content.substring(0, 100)}...</p>
              <small>
                Posted on: <Timestamp date={thread.created_at} />
              </small>
              <br />
              <Link to={`/threads/${thread.id}`}>View Details</Link>
              <div>
                <button onClick={() => navigate(`/threads/edit/${thread.id}`)} style={{ color: "blue" }}>
                  Edit
                </button>
                <DeleteThread threadId={thread.id} onThreadDeleted={() => handleThreadDeleted(thread.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        fetchThreads={fetchThreads}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        setPage={setPage}
      />

      <Link to="/create">Create New Thread</Link>
    </div>
  );
};

export default ThreadList;
