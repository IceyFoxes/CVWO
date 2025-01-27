import { useState, useEffect } from "react";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import { useRefresh } from "../contexts/RefreshContext";

interface InteractionConfig {
    fetchState: (id: string, username: string) => Promise<{ isActive: boolean; count: number }>;
    onActivate: (id: string, username: string) => Promise<void>;
    onDeactivate: (id: string, username: string) => Promise<void>;
    successMessage: { activate: string; deactivate: string };
    threadId: string;
}

const useInteraction = ({
    fetchState,
    onActivate,
    onDeactivate,
    successMessage,
    threadId,
}: InteractionConfig) => {
    const [isActive, setIsActive] = useState(false);
    const [count, setCount] = useState(0);
    const { showAlert } = useAlert();
    const { isLoggedIn, username } = useAuth();
    const { triggerRefresh } = useRefresh(); 

    useEffect(() => {
        if (!username || !isLoggedIn) return;

        const fetchInteractionStatus = async () => {
            try {
                const state = await fetchState(threadId, username);
                setIsActive(state.isActive);
                setCount(state.count);
            } catch (error) {
                showAlert("Error fetching interaction status!", "error");
                console.error("Error fetching interaction status:", error);
            }
        };

        fetchInteractionStatus();
        // eslint-disable-next-line
    }, [threadId, username, isLoggedIn, showAlert]);

    const toggleInteraction = async () => {
        if (!username || !isLoggedIn) {
            showAlert("You must be logged in to perform this action.", "warning");
            return;
        }

        try {
            if (isActive) {
                await onDeactivate(threadId, username);
                showAlert(successMessage.deactivate, "success");
                setCount((prev) => prev - 1);
            } else {
                await onActivate(threadId, username);
                showAlert(successMessage.activate, "success");
                setCount((prev) => prev + 1);
            }
            setIsActive(!isActive);
            triggerRefresh(); 
        } catch (error) {
            showAlert("Failed to update interaction. Please try again.", "error");
        }
    };

    return { isActive, count, toggleInteraction };
};

export default useInteraction;
