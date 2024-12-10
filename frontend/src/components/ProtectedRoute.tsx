import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      alert('You must be logged in to access this page!');
    }
  }, [username]); // Only run this effect when `username` changes

  if (!username) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
