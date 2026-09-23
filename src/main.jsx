import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
axios.defaults.withCredentials = true;
import App from './App.jsx';
import logger from './utils/logger.js';
import './output.css';
import { AuthProvider } from './context/AuthContext.jsx';

logger.info('Frontend app initialized');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
