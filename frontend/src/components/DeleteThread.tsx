import React from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";

export interface DeleteThreadProps {
  threadId: number;
  authorized?: boolean;
}

const DeleteThread: React.FC<DeleteThreadProps> = ({ threadId, authorized = false }) => {
  const navigate = useNavigate();
  const handleDelete = async () => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("You must be logged in to delete a thread.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this thread?");
    if (!confirmDelete) return;

    try {
      const threadResponse = await axiosInstance.get(`/threads/${threadId}`);
      await axiosInstance.delete(`/threads/${threadId}?username=${username}`);

      const { parent_id } = threadResponse.data.thread;
      if (parent_id) {
        navigate(`/threads/${parent_id}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Error during delete operation:", error);
      alert("Failed to delete the thread. Please try again.");
    }
  };

  if (!authorized) {
    console.log("Not authorized to delete."); 
    return null;
  }

  return (
    <button onClick={handleDelete} style={{ color: "red" }}>
      Delete
    </button>
  );
};

export default DeleteThread;
