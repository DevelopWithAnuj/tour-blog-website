import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

import App from './App.jsx';
import logger from './utils/logger.js';
import './input.css';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';

import { AuthProvider } from './context/AuthContext.jsx';
axios.defaults.withCredentials = true;
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider, toast } from './context/ToastContext.jsx';

axios.defaults.withCredentials = true

axios.interceptors.response.use((response) => response,
(error) => {
  const isSilentAuthCheck = error.config?.url?.includes('/auth/current-user') && error.response?.status === 401

  if(!isSilentAuthCheck) {
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
    toast(message, {type: 'error'})
  }
  return Promise.reject(error)
})
logger.info('Frontend app initialized');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
