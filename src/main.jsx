import React from 'react';
import { createRoot } from 'react-dom/client';
import './utils/axiosSetup.js';

import App from './App.jsx';
import logger from './utils/logger.js';
import './input.css';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';

import { AuthProvider } from './context/AuthContext.jsx';
import { ServerStatusProvider } from './context/ServerStatusContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider, toast } from './context/ToastContext.jsx';

logger.info('Frontend app initialized');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ServerStatusProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ServerStatusProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
