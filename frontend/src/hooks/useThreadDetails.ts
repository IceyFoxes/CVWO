import { useState, useEffect } from "react";
import { getThreadById } from "../services/threadService";

const useThreadDetails = (threadId: string) => {
    const [thread, setThread] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchThread = async () => {
            try {
                setLoading(true);
                const response = await getThreadById(threadId);
                setThread(response.thread);
                setError(null);
            } catch (err) {
                setError("Failed to fetch thread details.");
            } finally {
                setLoading(false);
            }
        };

        fetchThread();
    }, [threadId]);

    return { thread, error, loading };
};

export default useThreadDetails;
