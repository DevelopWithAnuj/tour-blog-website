import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';

const ServerStatusContext = createContext(null);
const HEALTH_CHECK_TIMEOUT_MS = 15_000;

export function ServerStatusProvider({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'up' | 'down'
  const healthCheckRequest = useRef(null);

  const checkServerHealth = useCallback(async () => {
    if (healthCheckRequest.current) {
      return healthCheckRequest.current;
    }

    setStatus('checking');

    healthCheckRequest.current = axios
      .get('/api/v1/healthcheck', { timeout: HEALTH_CHECK_TIMEOUT_MS })
      .then(() => setStatus('up'))
      .catch(() => setStatus('down'))
      .finally(() => {
        healthCheckRequest.current = null;
      });

    return healthCheckRequest.current;
  }, []);

  useEffect(() => {
    checkServerHealth();
  }, [checkServerHealth]);

  return (
    <ServerStatusContext.Provider value={{ status, retry: checkServerHealth }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  const ctx = useContext(ServerStatusContext);
  if (!ctx) {
    throw new Error('useServerStatus must be used within ServerStatusProvider');
  }
  return ctx;
}
