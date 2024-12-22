import React, { useState } from 'react';
import axiosInstance from "../axiosConfig";
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const message = location.state?.message || null;
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    axiosInstance.post('/users/login', { username })
      .then((response) => {
        sessionStorage.setItem('username', username); 
        sessionStorage.setItem("jwtToken", response.data.token);
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
          <label htmlFor="username">Username:</label>
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
