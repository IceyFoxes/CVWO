import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchThreads, fetchAuthorization, Thread } from "./FetchThreads";
import DeleteThread from "./DeleteThread";
import Search from "./Search";
import Sort from "./Sort";
import Pagination from "./Pagination";
import Timestamp from "./Timestamp";

const ThreadList: React.FC = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [sortBy, setSortBy] = useState("created_at");
  const [searchQuery, setSearchQuery] = useState("");
  const [authStatus, setAuthStatus] = useState<{ [key: number]: boolean }>({});

  const username = localStorage.getItem("username");

  // Fetch threads and handle pagination, sorting, and search
  const fetchAndSetThreads = useCallback(async () => {
    setLoading(true);
    try {
      const { threads, totalPages } = await fetchThreads({
        searchQuery,
        page: pagination.page,
        sortBy,
      });
      setThreads(threads);
      setPagination((prev) =>
        prev.totalPages !== totalPages ? { ...prev, totalPages } : prev
      );
      setError(null);

      // Fetch authorization for all threads after fetching
      if (username) {
        const authMap: { [key: number]: boolean } = {};
        await Promise.all(
          threads.map(async (thread: Thread) => {
            const authorized = await fetchAuthorization(thread.id, username);
            authMap[thread.id] = authorized;
          })
        );
        setAuthStatus(authMap);
      }
    } catch (err) {
      setError("Failed to fetch threads.");
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.page, sortBy, username]);

  // Initial fetch and watch for relevant state changes
  useEffect(() => {
    if (!username) {
      navigate("/login", { state: { message: "You must be logged in!" } });
    } else {
      fetchAndSetThreads();
    }
  }, [username, fetchAndSetThreads, navigate]);

  const handleThreadDeleted = (threadId: number) => {
    setThreads((prevThreads) => prevThreads.filter((thread) => thread.id !== threadId));
  };

  return (
    <div>
      <h1>Threads</h1>

      {/* Search Component */}
      <Search
        searchQuery={searchQuery}
        setSearchQuery={(query) => {
          setSearchQuery(query);
          setPagination((prev) => ({ ...prev, page: 1 })); // Reset pagination to page 1
        }}
      />

      {/* Sort Component */}
      <Sort
        sortBy={sortBy}
        setSortBy={(newSortBy) => {
          setSortBy(newSortBy);
          setPagination({ page: 1, totalPages: pagination.totalPages });
        }}
      />

      {/* Error Messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Thread List */}
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
              {/* Thread Details Component */}
              <Link to={`/threads/${thread.id}`}>View Details</Link>
              <div>
                {authStatus[thread.id] && (
                  <>
                    {/* Edit Component */}
                    <button
                      onClick={() => navigate(`/threads/edit/${thread.id}`)}
                      style={{ color: "blue" }}
                    >
                      Edit
                    </button>
                    {/* Delete Component */}
                    <DeleteThread
                      threadId={thread.id}
                      onThreadDeleted={() => handleThreadDeleted(thread.id)}
                    />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Component */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        setPage={(page: number) => setPagination({ ...pagination, page })}
      />

      <Link to="/create">Create New Thread</Link>
    </div>
  );
};

export default ThreadList;
