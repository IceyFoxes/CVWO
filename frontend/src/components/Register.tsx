import React, { useState } from 'react';
import axiosInstance from "../axiosConfig";
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    axiosInstance.post('/users', { username })
      .then(() => {
        alert('Registration successful!');
        navigate('/login'); // Redirect to login page after successful registration
      })
      .catch((error) => {
        if (error.response) {
          setError(error.response.data.error);
        } else {
          setError('Unexpected error occurred. Please try again.');
        }
      });
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
