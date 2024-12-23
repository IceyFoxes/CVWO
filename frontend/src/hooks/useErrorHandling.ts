import { useState } from "react";

const useErrorHandling = () => {
    const [error, setError] = useState<string | null>(null);

    const handleError = (error: any, fallbackMessage: string = "An error occurred.") => {
        const message = error.response?.data?.error || fallbackMessage;
        setError(message);
        console.error("Error:", message);
    };

    return { error, setError, handleError };
};

export default useErrorHandling;
