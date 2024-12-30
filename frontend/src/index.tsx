import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AlertProvider } from './components/contexts/AlertContext';
import { RefreshProvider } from './components/contexts/RefreshContext';
import { AuthProvider } from './components/contexts/AuthContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <AuthProvider>     
      <AlertProvider>
        <RefreshProvider>
          <App />
        </RefreshProvider>
      </AlertProvider>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
