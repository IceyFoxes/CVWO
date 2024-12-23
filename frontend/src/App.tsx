import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import ThreadList from './pages/ThreadList';
import CreateThread from './components/CreateThread';
import Register from './pages/Register';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import EditThread from './components/EditThread';
import ThreadDetails from './pages/ThreadDetails';
import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Router>
          <Navbar />
          <div className="App">
            <Routes>
              <Route path="/" element={<ThreadList />} />
              <Route path="/create" element={<CreateThread />}/>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/threads/:id" element={<ThreadDetails />} />
              <Route path="/threads/edit/:id" element={<EditThread />} />
            </Routes>
          </div>
        </Router>
    </ThemeProvider>
  );
};

export default App;