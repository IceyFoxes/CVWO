import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import ThreadList from './components/ThreadList';
import CreateThread from './components/CreateThread';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import EditThread from './components/EditThread';
// import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<ThreadList />} />
          <Route path="/create" element={<CreateThread />}/>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/threads/edit/:id" element={<EditThread />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;