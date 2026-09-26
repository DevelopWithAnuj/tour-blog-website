import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';

const ServerStatusContext = createContext(null);

export function ServerStatusProvider({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'up' | 'down'

  const checkServerHealth = useCallback(async () => {
    setStatus('checking');
    try {
      await axios.get('/api/v1/healthcheck');
      setStatus('up');
    } catch {
      setStatus('down');
    }
  }, []);

  useEffect(() => {
    checkServerHealth();
  }, [checkServerHealth]);

  useEffect(() => {
    const handleDown = () => setStatus('down');
    window.addEventListener('server-unavailable', handleDown);
    return () => window.removeEventListener('server-unavailable', handleDown);
  }, []);

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
