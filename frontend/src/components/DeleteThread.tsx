import React from "react";
import axios from "axios";

export interface DeleteThreadProps {
  threadId: number;
  onThreadDeleted: () => void;
  authorized?: boolean; // Add the disabled prop
}

const DeleteThread: React.FC<DeleteThreadProps> = ({ threadId, onThreadDeleted, authorized = false }) => {
  const handleDelete = async () => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("You must be logged in to delete a thread.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this thread?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/threads/${threadId}?username=${username}`);
      alert("Thread deleted successfully.");
      onThreadDeleted();
    } catch (error) {
      console.error("Failed to delete thread:", error);
      alert("Failed to delete the thread.");
    }
  };

  // If the user is not authorized, do not render the button
  if (!authorized) {
    return null;
  }

  return (
    <button onClick={handleDelete} style={{ color: "red" }}>
      Delete
    </button>
  );
};

export default DeleteThread;
