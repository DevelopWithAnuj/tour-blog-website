import React from 'react';
import { createRoot } from 'react-dom/client';
import logger from './utils/logger.js';
import App from './App.jsx';
import './input.css';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import { AuthProvider } from './context/AuthContext.jsx';
import axios from 'axios';
axios.defaults.withCredentials = true;

logger.info('Frontend app initialized');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
