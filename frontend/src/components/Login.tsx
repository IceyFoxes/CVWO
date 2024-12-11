import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const message = location.state?.message || null;
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    axios.post('http://localhost:8080/login', { username })
      .then((response) => {
        alert('Login successful!');
        localStorage.setItem('username', username); // Store username for future use
        navigate('/'); // Redirect to the home page after login
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
      {message && <p style={{ color: "red" }}>{message}</p>}
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
