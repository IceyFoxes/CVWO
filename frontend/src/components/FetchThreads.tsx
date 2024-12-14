import axios from "axios";

export interface FetchThreadsOptions {
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface Thread {
  id: number;
  title: string;
  content: string;
  created_at: string;
  likes: number;
}

// Fetch threads with pagination and sorting
export const fetchThreads = async (options: FetchThreadsOptions) => {
  const { searchQuery = "", page = 1, limit = 3, sortBy = "created_at" } = options;
  try {
    const response = await axios.get("http://localhost:8080/threads", {
      params: { search: searchQuery, page, limit, sortBy },
    });
    return {
      threads: response.data.threads || [],
      totalPages: response.data.totalPages || 1,
    };
  } catch (err) {
    console.error("Failed to fetch threads:", err);
    throw new Error("Failed to fetch threads.");
  }
};

// Fetch authorization status for a thread
export const fetchAuthorization = async (threadId: number, username: string | null) => {
  try {
    const response = await axios.get(`http://localhost:8080/threads/${threadId}/authorize`, {
      params: { username },
    });
    return response.data.authorized || false;
  } catch (err) {
    console.error(`Failed to fetch authorization for thread ${threadId}:`, err);
    return false;
  }
};

