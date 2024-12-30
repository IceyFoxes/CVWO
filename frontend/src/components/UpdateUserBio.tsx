import React, { useState } from "react";
import CustomModal from "./shared/Modal";
import { TextField } from "@mui/material";
import { updateUserBio } from "../services/userService"; 
import { useAlert } from "./contexts/AlertContext";

interface UpdateUserBioProps {
    open: boolean;
    username: string;
    currentBio: string;
    onClose: () => void;
    onBioUpdate: (newBio: string) => void;
}

const UpdateUserBio: React.FC<UpdateUserBioProps> = ({ open, username, currentBio, onClose, onBioUpdate }) => {
    const [bio, setBio] = useState(currentBio);
    const { showAlert } = useAlert();

    const handleSave = async () => {
        try {
            await updateUserBio(username, bio);
            showAlert("Bio updated successfully!", "success");
            onBioUpdate(bio); 
            onClose(); 
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Failed to update bio.";
            showAlert(errorMessage, "error");
        }
    };

    return (
        <CustomModal
            open={open}
            title="Update Bio"
            onClose={onClose}
            onConfirm={handleSave} 
        >
            <TextField
                fullWidth
                multiline
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                sx={{ mt: 2 }}
            />
        </CustomModal>
    );
};

export default UpdateUserBio;
