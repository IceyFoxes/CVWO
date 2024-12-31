import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomModal from "./shared/Modal";
import { useAlert } from "./contexts/AlertContext";
import { deleteThread, getThreadById } from "../services/threadService";
import { DangerButton } from "./shared/Buttons";
import { useAuth } from "./contexts/AuthContext";

const DeleteThread: React.FC<{ threadId: string; authorized?: boolean }> = ({ threadId, authorized = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const { username } = useAuth();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleDelete = async () => {
        try {
            const data = await getThreadById(threadId);

            await deleteThread(threadId, username ?? "");
            showAlert("Thread deleted successfully.", "success");
            handleCloseModal();

            const { parent_id } = data.thread;
            if (parent_id) {
                navigate(`/threads/${parent_id}`);
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Error during delete operation:", error);
            showAlert("Failed to delete the thread. Please try again.", "error");
        }
    };

    if (!authorized) {
        return null;
    }

    return (
        <div>
            <DangerButton onClick={handleOpenModal}>Delete</DangerButton>

            <CustomModal
                open={isModalOpen}
                onClose={handleCloseModal}
                title="Confirm Deletion"
                onConfirm={handleDelete}
            >
                <p>Are you sure you want to delete this thread? This action cannot be undone.</p>
            </CustomModal>
        </div>
    );
};

export default DeleteThread;

