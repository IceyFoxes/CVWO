import React, { useEffect, useState } from "react";
import { getSaveState, saveThread, unsaveThread } from "../services/interactionService";
import { PrimaryButton } from "./shared/Buttons";
import { useAlert } from "./contexts/AlertContext";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { useRefresh } from "./contexts/RefreshContext";

interface SaveUnsaveProps {
    threadId: string; 
}

const SaveUnsave: React.FC<SaveUnsaveProps> = ({ threadId }) => {
    const [isSaved, setIsSaved] = useState(false);
    const { showAlert } = useAlert();
    const { triggerRefresh } = useRefresh(); 
    
    const username = sessionStorage.getItem("username");

    useEffect(() => {
        const fetchSaveStatus = async () => {
            try {
                const savedData = await getSaveState(threadId, username ?? "");
                setIsSaved(savedData.isSaved);
            } catch (error) {
                console.error("Failed to fetch save status:", error);
            }
        };
        fetchSaveStatus();
    }, [threadId]);

    const toggleSave = async () => {
        try {
            if (isSaved) {
                await unsaveThread(threadId, username ?? "");
                showAlert("Thread unsaved successfully!", "success");
            } else {
                await saveThread(threadId, username ?? "");
                showAlert("Thread saved successfully!", "success");
            }
            setIsSaved(!isSaved);
            triggerRefresh();
        } catch (error: any) {
            showAlert("Failed to update save status. Please try again.", "error");
        }
    };
    
    return (
        <PrimaryButton onClick={toggleSave} startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}>
            {isSaved ? "Unsave" : "Save"}
        </PrimaryButton>
    );
};

export default SaveUnsave;
