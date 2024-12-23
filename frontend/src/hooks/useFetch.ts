import { useState, useEffect } from "react";

const useFetch = <T>(fetchFunction: () => Promise<T>, dependencies: any[] = []) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await fetchFunction();
                setData(result);
                setError(null);
            } catch (err) {
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, dependencies);

    return { data, loading, error };
};

export default useFetch;
