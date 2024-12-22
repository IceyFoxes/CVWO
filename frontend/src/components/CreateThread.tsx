import React, { useState } from 'react';
import axiosInstance from "../axiosConfig";
import { useNavigate } from 'react-router-dom';

const CreateThread: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const navigate = useNavigate();

  const username = sessionStorage.getItem('username');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Send the request to create a new thread
    axiosInstance.post(`/threads?username=${username}`, { title, content })
      .then(() => {
        alert('Thread created successfully!');
        navigate('/');
      })
      .catch((error) => {
        if (error.response) {
          const errors = error.response.data.errors || [error.response.data.error];
          alert(errors.join('\n')); // Show backend validation errors
        } else {
          alert('An unexpected error occurred. Please try again.');
        }
      });
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