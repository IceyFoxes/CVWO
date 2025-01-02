import React from "react";
import { PrimaryButton } from "../shared/Buttons";
import useInteraction from "../hooks/useInteraction";
import { saveThread, unsaveThread, getSaveState } from "../../services/interactionService";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const SaveUnsave: React.FC<{ threadId: string }> = ({ threadId }) => {
    const saveHook = useInteraction({
        fetchState: (id, username) =>
            getSaveState(id, username).then((state) => ({
                isActive: state.isSaved,
                count: 0, // No count needed for saving
            })),
        onActivate: saveThread,
        onDeactivate: unsaveThread,
        successMessage: { activate: "Thread saved!", deactivate: "Thread unsaved!" },
        threadId,
    });

    return (
        <PrimaryButton
            onClick={saveHook.toggleInteraction}
            startIcon={saveHook.isActive ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        >
            {saveHook.isActive ? "Unsave" : "Save"}
        </PrimaryButton>
    );
};

export default SaveUnsave;
