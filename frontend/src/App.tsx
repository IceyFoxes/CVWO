import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ThreadDetails from './pages/ThreadPage';
import CssBaseline from "@mui/material/CssBaseline";
import UITestingPage from './pages/UITestingPage';
import ColorModeProvider from "./theme/ColorMode";
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <ColorModeProvider>
        <CssBaseline />
          <Router>
              <div className="App">
                  <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/category/:category" element={<CategoryPage />} />
                      <Route path="/threads/:id" element={<ThreadDetails />} />
                      <Route path="/profile/:usernameProfile" element={<ProfilePage />} />
                      <Route path="/test" element={<UITestingPage />} />
                  </Routes>
              </div>
          </Router>
    </ColorModeProvider>
  );
};

export default App;