import React from "react";
import axios from "axios";

interface DeleteThreadProps {
  threadId: number;
  onThreadDeleted: () => void;
}

const DeleteThread: React.FC<DeleteThreadProps> = ({ threadId, onThreadDeleted }) => {
  const username = localStorage.getItem("username");

  const handleDelete = async () => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this thread?");
      if (!confirm) return;

      const response = await axios.delete(
        `http://localhost:8080/threads/${threadId}?username=${username}`
      );
      alert(response.data.message);
      onThreadDeleted();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to delete thread.");
    }
  };

  return (
    <button onClick={handleDelete} style={{ color: "red" }}>
      Delete
    </button>
  );
};

export default DeleteThread;
