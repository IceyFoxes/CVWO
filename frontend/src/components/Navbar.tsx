import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();  
  const [currentThreadId, setCurrentThreadId] = useState<number | null>(null);
  const username = sessionStorage.getItem("username");

  // Use effect to set the current thread ID (could be useful in other cases too)
  useEffect(() => {
    if (id) {
      setCurrentThreadId(parseInt(id)); // Parse the ID from the URL parameter
    }
  }, [id]);  // Re-run if the ID changes

  const handleLogout = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("jwtToken");
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {username ? (
          <>
            <li>
              <Link to="/create">Create Thread</Link>
            </li>
            {currentThreadId && (
              <>
                <li>
                  <Link to={`/threads/edit/${currentThreadId}`}>Edit Thread</Link>
                </li>
                <li>
                  <Link to={`/threads/delete/${currentThreadId}`}>Delete Thread</Link>
                </li>
              </>
            )}
            <li>Welcome, {username}</li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
