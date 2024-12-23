import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThread } from '../services/threadService';

const CreateThread: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const navigate = useNavigate();

  const username = sessionStorage.getItem('username');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (!username) {
          console.error("Username is undefined. Redirecting to Login.");
          navigate("/login");
          return null;
        }
        await createThread(username, title, content);
        alert("Thread created successfully!");
        navigate("/");
    } catch (error: any) {
        if (error.response) {
            const errors = error.response.data.errors || [error.response.data.error];
            alert(errors.join("\n"));
        } else {
            alert("An unexpected error occurred. Please try again.");
        }
    }
};

  return (
    <div>
      <h1>Create a New Thread</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Thread</button>
      </form>
    </div>
  );
};

export default CreateThread;